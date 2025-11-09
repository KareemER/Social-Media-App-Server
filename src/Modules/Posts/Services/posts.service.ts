import { NextFunction, Request, Response } from "express";

import { FriendShipRepository, PostRepository, UserRepository } from "../../../DB/Repositories";
import { FriendShipStatusEnum, IRequest } from "../../../Common";
import { UserModel } from "../../../DB/Models";
import { pagination, BadRequestException, S3ClientService, SuccessResponse } from "../../../Utils";
import mongoose, { Types } from "mongoose";

class postsService {
    private postRepo = new PostRepository()
    private userRepo = new UserRepository(UserModel)
    private friendShipRepo = new FriendShipRepository()
    private S3ClientService = new S3ClientService()


    addPost = async (req: Request, res: Response, next: NextFunction) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { description, allowComments, tags } = req.body
        const files = req.files as Express.Multer.File[];

        if(!description && (files && !files.length)) throw new BadRequestException('Description or files is required')
        
        let uniqueTags: Types.ObjectId[] = []
        if(tags) {
            const users = await this.userRepo.findDocuments({ _id: { $in: tags } })
            if(users.length !== tags.length) throw new BadRequestException('Invalid tags')

            const friends = await this.friendShipRepo.findDocuments({
                status: FriendShipStatusEnum.ACCEPTED,
                $or: [
                    { requestFromId: _id, requestToId: { $in: tags } },
                    { requestFromId: { $in: tags }, requestToId: _id }
                ]
            })
            if(friends.length !== tags.length) throw new BadRequestException('Invalid tags')
            
            uniqueTags = Array.from(new Set(tags))
        }

        let attachments: string[] = []
        if(files?.length){
            const uploadedData = await this.S3ClientService.UploadFilesOnS3(files, `${ _id }/posts`)
            attachments = uploadedData.map(({key}) => (key))
        }

        const post = await this.postRepo.createNewDocument({
            description,
            attachments,
            ownerId: _id as Types.ObjectId,
            allowComments,
            tags: uniqueTags
        })
        res.json(SuccessResponse('Post created successfully', 201, post))
    }

    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { postId } = req.params;
        const { description, allowComments, tags, removeOldAttachments } = req.body;
        const files = req.files as Express.Multer.File[];

        const posts = await this.postRepo.findDocuments({ _id: postId, ownerId: _id });
        const post = posts[0];
        if (!post) throw new BadRequestException('Post not found or unauthorized');

        let uniqueTags: Types.ObjectId[] = [];
        if (tags && tags.length) {
            const users = await this.userRepo.findDocuments({ _id: { $in: tags } });
            if (users.length !== tags.length) throw new BadRequestException('Invalid tags');

            const friends = await this.friendShipRepo.findDocuments({
                status: FriendShipStatusEnum.ACCEPTED,
                $or: [
                    { requestFromId: _id, requestToId: { $in: tags } },
                    { requestFromId: { $in: tags }, requestToId: _id }
                ]
            });

            if (friends.length !== tags.length) throw new BadRequestException('Invalid tags');
            uniqueTags = Array.from(new Set(tags));
        }

        let newAttachments: string[] = post.attachments || [];
        if (files?.length) {
            const uploadedData = await this.S3ClientService.UploadFilesOnS3(files, `${_id}/posts`);
            const uploadedKeys = uploadedData.map(({ key }) => key);
            newAttachments = [...newAttachments, ...uploadedKeys];
        }

        if (removeOldAttachments?.length) {
            newAttachments = newAttachments.filter(att => !removeOldAttachments.includes(att));
            await this.S3ClientService.deleteFileFromS3(removeOldAttachments);
        }

        const updatedPost = await this.postRepo.updateOneDocument(
            { _id: postId },
            {
                ...(description && { description }),
                ...(allowComments !== undefined && { allowComments }),
                ...(uniqueTags.length && { tags: uniqueTags }),
                attachments: newAttachments
            }
        );

        res.json(SuccessResponse('Post updated successfully', 200, updatedPost));
    };

    listHomePosts = async (req: Request, res: Response, next: NextFunction) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { page, limit } = req.query
        const { limit: currentLimit, skip } = pagination({page: Number(page), limit: Number(limit) })

        const totalPages = await this.postRepo.postPagination({}, {
            limit: currentLimit,
            page: Number(page),
            customLabels: {
                totalDocs: 'totalPosts',
                docs: 'posts',
                page: 'currentPage',
                meta: 'meta'                
            },
            populate: [
                {
                    path: 'ownerId',
                    select: 'firstName lastName '
                }
            ]
        })

        const posts = await this.postRepo.findDocuments({  ownerId: { $ne: _id } }, {}, { limit: currentLimit, skip})
        return res.json(SuccessResponse('Posts fetched successfully', 200, { posts, totalPages }))
    }

    getPostById = async (req: Request, res: Response, next: NextFunction) => {  
        const { postId } = req.params;
        if (!postId) throw new BadRequestException('postId is required');

        const post = await this.postRepo.findDocumentById(postId as unknown as mongoose.Schema.Types.ObjectId)
        if (!post) throw new BadRequestException('Post not found');

        await post.populate([
         { path: 'ownerId', select: 'firstName lastName' },
         { path: 'tags', select: 'firstName lastName' }
        ])  

        return res.json(SuccessResponse('Post fetched successfully', 200, post));

    };

    getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;

        const posts = await this.postRepo.findDocuments({ ownerId: _id });
        if (!posts.length) throw new BadRequestException('No posts found for this user');

        const populatedPosts = await Promise.all(
            posts.map(post => post.populate([
                { path: 'ownerId', select: 'firstName lastName' },
                { path: 'tags', select: 'firstName lastName' }
            ]))
        );

        return res.json(SuccessResponse('Posts fetched successfully', 200, populatedPosts));
    };

    deletePost = async (req: Request, res: Response, next: NextFunction) => {

        const _id = (req as IRequest).loggedInUser.user._id as Types.ObjectId;

        const { postId } = req.params;
        if (!postId) throw new BadRequestException('postId is required');

        const post = await this.postRepo.findDocumentById(postId as unknown as mongoose.Schema.Types.ObjectId);
        if (!post) throw new BadRequestException('Post not found');

        if (post.ownerId.toString() !== _id.toString()) {
            throw new BadRequestException('You are not allowed to delete this post');
        }

        if (post.attachments?.length) {
            for (const fileKey of post.attachments) {
                await this.S3ClientService.deleteFileFromS3(fileKey);
            }
        }

        await this.postRepo.deleteOneDocumentById(post._id as unknown as mongoose.Schema.Types.ObjectId);

        return res.json(SuccessResponse('Post deleted successfully', 200));

    
};


}

export default new postsService