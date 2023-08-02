import Post from './post'
import PostRepository from './postRepository'

export const addPost = (userId: string, title: string, body: string) => {
    const post = new Post(userId, title, body)
    PostRepository.post(post)
    return post
}

export const get = async (id: string) => {
    return await PostRepository.get(id)
}

export default {addPost, get}