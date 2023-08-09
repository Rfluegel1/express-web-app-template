import Post from './post'
import PostRepository from './postRepository'

export default class PostService {
    postRepository = new PostRepository()

    async addPost(userId: string, title: string, body: string) {
        const post = new Post(userId, title, body)
        await this.postRepository.post(post)
        return post
    }

    async getAll() {
        return await this.postRepository.getAll()
    }

    async get(id: string) {
        return await this.postRepository.get(id)
    }

    async update(id: string, userId: string | undefined, title: string | undefined, body: string) {
        let post = await this.get(id)
        post.updateDefinedFields(userId, title, body)
        await this.postRepository.update(post)
        return post
    }

    async del(id: string) {
        await this.postRepository.del(id)
    }
}