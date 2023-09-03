import {NextFunction, Request, Response} from 'express'
import PostService from './postService'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../exceptions/badRequestException'
import Post from './post'

export default class PostController {
    postService: PostService = new PostService()

    async createPost(request: Request, response: Response) {
        let title: string = request.body.title
        let body: string = request.body.body
        let userId: string = request.body.userId
        const post: Post = await this.postService.createPost(userId, title, body)
        return response.status(StatusCodes.CREATED).send({
            message: post
        })
    }

    async deletePost(request: Request, response: Response, next: NextFunction) {
        let id: string = request.params.id
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            await this.postService.deletePost(id)
            return response.sendStatus(StatusCodes.NO_CONTENT)
        } catch (error) {
            next(error)
        }
    }

    async getPost(request: Request, response: Response, next: NextFunction) {
        let id: string = request.params.id
        let post: Post
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            post = await this.postService.getPost(id)
            return response.status(200).send({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }

    async getPosts(request: Request, response: Response) {
        const posts: Post[] = await this.postService.getAllPosts()
        return response.status(200).send({
            message: posts
        })
    }

    async updatePost(request: Request, res: Response, next: NextFunction) {
        const id: string = request.params.id
        const userId: string = request.body.userId
        const title: string = request.body.title
        const body: string = request.body.body
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            let post: Post = await this.postService.updatePost(id, userId, title, body)
            return res.status(200).send({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }
}

