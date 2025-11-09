import { BaseRepository } from "./base.repository";
import { IPost } from "../../Common";
import { PostModel } from "../Models";
import { FilterQuery, PaginateOptions } from "mongoose";



export class PostRepository extends BaseRepository<IPost> {
    private PostModel; 

    constructor() {
        super(PostModel)
        this.PostModel = PostModel
    }

    async countDocuments(filter = {}) {
        return await this.PostModel.countDocuments(filter)
    }

    async postPagination(filters?: FilterQuery<IPost>, options?: PaginateOptions) {
        return await this.PostModel.paginate(filters, options)
    }
}