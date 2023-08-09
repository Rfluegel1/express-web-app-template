import {NextFunction, Request, Response} from 'express'
import PostService from './postService'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from '../notFoundException'

export default class PostController {
    postService = new PostService()

    async getPosts(req: Request, res: Response) {
        const posts = await this.postService.getAll()
        return res.status(200).json({
            message: posts
        })
    }

    async getPost(req: Request, res: Response, next: NextFunction) {
        let id: string = req.params.id
        let post
        try {
            post = await this.postService.get(id)
            return res.status(200).json({
                message: post
            })
        } catch (error) {
            next(error)
        }
    }

    async updatePost(req: Request, res: Response) {
        let id: string = req.params.id
        let userId: string = req.body.userId
        let title: string = req.body.title
        let body: string = req.body.body
        let post = await this.postService.update(id, userId, title, body)
        return res.status(200).json({
            message: post
        })
    }

    async deletePost(req: Request, res: Response) {
        let id: string = req.params.id
        await this.postService.del(id)
        return res.sendStatus(StatusCodes.NO_CONTENT)
    }

    async addPost(req: Request, res: Response) {
        let title: string = req.body.title
        let body: string = req.body.body
        let userId: string = req.body.userId
        const response = await this.postService.addPost(userId, title, body)
        return res.status(StatusCodes.CREATED).json({
            message: response
        })
    }

    errorHandler(err: any, req: Request, res: Response, next: any) {
        if (err.message === 'not found') {
            return res.status(StatusCodes.NOT_FOUND).json({message: err.message})
        }
        if (err instanceof NotFoundException) {
            // Handle the custom error and return a specific error code
            return res.status(StatusCodes.NOT_FOUND).json({message: err.message})
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Internal Server Error'})
    }
}

