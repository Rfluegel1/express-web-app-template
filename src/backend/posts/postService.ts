import Post from './post'
import PostRepository from './postRepository'

const cls = require('cls-hooked')
const namespace = cls.getNamespace('global')

export default class PostService {
    postRepository = new PostRepository()

    async createPost(userId: string, title: string, body: string): Promise<Post> {
        const post: Post = new Post(userId, title, body)
        await this.postRepository.createPost(post)
        return post
    }

    async deletePost(id: string): Promise<void> {
        await this.postRepository.deletePost(id)
    }

    async getPost(id: string): Promise<Post> {
        // console.log('service Logger: ', namespace.get('logger'))
        // namespace.get('logger').info('getting')
        return await this.postRepository.getPost(id)
    }

    async getAllPosts(): Promise<Post[]> {
        return await this.postRepository.getAllPosts()
    }

    async updatePost(id: string, userId: string, title: string, body: string): Promise<Post> {
        let post: Post = await this.getPost(id)
        post.updateDefinedFields(userId, title, body)
        await this.postRepository.updatePost(post)
        return post
    }
}