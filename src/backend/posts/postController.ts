import {NextFunction, Request, Response} from 'express'
import PostService from './postService'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../exceptions/badRequestException'
import Post from './post'
import {getLogger} from '../Logger'

export default class PostController {
    postService: PostService = new PostService()

    async createPost(request: Request, response: Response) {
        getLogger().info('Received create post request')
        let title: string = request.body.title
        let body: string = request.body.body
        let userId: string = request.body.userId
        const post: Post = await this.postService.createPost(userId, title, body)
        getLogger().info('Sending create post response')
        return response.status(StatusCodes.CREATED).send({
            message: post
        })
    }

    async deletePost(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received delete post request')
        let id: string = request.params.id
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            await this.postService.deletePost(id)
            getLogger().info('Sending delete post response')
            return response.sendStatus(StatusCodes.NO_CONTENT)
        } catch (error) {
            next(error)
        }
    }

    async getPost(request: Request, response: Response, next: NextFunction) {
        getLogger().info('Received get post request')
        let id: string = request.params.id
        let post: Post
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            post = await this.postService.getPost(id)
            getLogger().info('Sending get post response')
            return response.status(200).send({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }

    async getPosts(request: Request, response: Response) {
        getLogger().info('Received get all posts request')
        const posts: Post[] = await this.postService.getAllPosts()
        getLogger().info('Sending get all posts request')
        return response.status(200).send({
            message: posts
        })
    }

    async updatePost(request: Request, res: Response, next: NextFunction) {
        getLogger().info('Received update post request')
        const id: string = request.params.id
        const userId: string = request.body.userId
        const title: string = request.body.title
        const body: string = request.body.body
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            let post: Post = await this.postService.updatePost(id, userId, title, body)
            getLogger().info('Sending update post request')
            return res.status(200).send({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }
}

