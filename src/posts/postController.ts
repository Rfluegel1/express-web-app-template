import {NextFunction, Request, Response} from 'express'
import PostService from './postService'
import {StatusCodes} from 'http-status-codes'
import {UUID_REG_EXP} from '../contants'
import {BadRequestException} from '../badRequestException'

export default class PostController {
    postService = new PostService()

    async createPost(req: Request, res: Response) {
        let title: string = req.body.title
        let body: string = req.body.body
        let userId: string = req.body.userId
        const response = await this.postService.createPost(userId, title, body)
        return res.status(StatusCodes.CREATED).json({
            message: response
        })
    }

    async deletePost(req: Request, res: Response, next: NextFunction) {
        let id: string = req.params.id
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            await this.postService.deletePost(id)
            return res.sendStatus(StatusCodes.NO_CONTENT)
        } catch (error) {
            next(error)
        }
    }

    async getPost(req: Request, res: Response, next: NextFunction) {
        let id: string = req.params.id
        let post
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            post = await this.postService.getPost(id)
            return res.status(200).json({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }

    async getPosts(req: Request, res: Response) {
        const posts = await this.postService.getAllPosts()
        return res.status(200).json({
            message: posts
        })
    }

    async updatePost(req: Request, res: Response, next: NextFunction) {
        let id: string = req.params.id
        let userId: string = req.body.userId
        let title: string = req.body.title
        let body: string = req.body.body
        if (!id.match(UUID_REG_EXP)) {
            return next(new BadRequestException(id))
        }
        try {
            let post = await this.postService.updatePost(id, userId, title, body)
            return res.status(200).json({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }
}

