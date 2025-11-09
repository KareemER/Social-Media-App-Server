import { Router } from "express";
import { authenticationMiddleware, Multer } from "../../Middlewares";
import postsService from './Services/posts.service'
const postsController = Router()

// Add post
postsController.post('/add', authenticationMiddleware, Multer().array('attachments', 3), postsService.addPost)

// Update post
postsController.put('/update/:postId', authenticationMiddleware, Multer().array('attachments', 3), postsService.updatePost)

// Delete post
postsController.delete('/delete/:postId', authenticationMiddleware, postsService.deletePost)

// Get all post
postsController.get('/home', authenticationMiddleware, postsService.listHomePosts)

// Get post by id
postsController.get('/get-post-byId/:postId', authenticationMiddleware, postsService.getPostById)

// Get all posts for specific user
postsController.get('/user-posts', authenticationMiddleware, postsService.getUserPosts)

export {postsController}