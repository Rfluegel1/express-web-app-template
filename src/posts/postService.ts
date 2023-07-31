import Post from './post'
import PostRepository from './postRepository'

export const post = (userId: string, title: string, message: string): Post => {
    PostRepository.post(userId, title, message)
    return new Post(userId, title, message)
}

export default {post}