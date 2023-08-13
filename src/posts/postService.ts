import Post from './post'
import PostRepository from './postRepository'

export default class PostService {
    postRepository = new PostRepository()

    async createPost(userId: string, title: string, body: string) {
        const post = new Post(userId, title, body)
        await this.postRepository.createPost(post)
        return post
    }

    async deletePost(id: string) {
        await this.postRepository.deletePost(id)
    }

    async getPost(id: string) {
        return await this.postRepository.getPost(id)
    }

    async getAllPosts() {
        return await this.postRepository.getAllPosts()
    }

    async updatePost(id: string, userId: string | undefined, title: string | undefined, body: string) {
        let post = await this.getPost(id)
        post.updateDefinedFields(userId, title, body)
        await this.postRepository.updatePost(post)
        return post
    }
}