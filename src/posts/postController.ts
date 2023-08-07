import {Request, Response} from 'express'
import axios, {AxiosResponse} from 'axios'
import Post from './post'
import PostService from './postService'
import postService from './postService'
import {StatusCodes} from 'http-status-codes'


const getPosts = async (req: Request, res: Response) => {
    let result: AxiosResponse = await axios.get(`https://jsonplaceholder.typicode.com/posts`)
    let posts: [Post] = result.data
    return res.status(200).json({
        message: posts
    })
}

const getPost = async (req: Request, res: Response) => {
    let id: string = req.params.id
    const post = await PostService.get(id)
    return res.status(200).json({
        message: post
    })
}

const updatePost = async (req: Request, res: Response) => {
    let id: string = req.params.id
    let userId: string = req.body.userId
    let title: string = req.body.title
    let body: string = req.body.body
    let post = await PostService.update(id, userId, title, body)
    return res.status(200).json({
        message: post
    })
}

const deletePost = async (req: Request, res: Response) => {
    let id: string = req.params.id
    await postService.del(id)
    return res.sendStatus(StatusCodes.NO_CONTENT)
}

const addPost = async (req: Request, res: Response) => {
    let title: string = req.body.title
    let body: string = req.body.body
    let userId: string = req.body.userId
    const response = await PostService.addPost(userId, title, body)
    return res.status(StatusCodes.CREATED).json({
        message: response
    })
}

export default {getPosts, getPost, updatePost, deletePost, addPost}