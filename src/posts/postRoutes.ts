import express from 'express'
import PostController from './postController'

const router = express.Router()

let postController = new PostController()
router.get('/posts', postController.getPosts.bind(postController))
router.get('/posts/:id', postController.getPost.bind(postController))
router.put('/posts/:id', postController.updatePost.bind(postController))
router.delete('/posts/:id', postController.deletePost.bind(postController))
router.post('/posts', postController.addPost.bind(postController))

export = router