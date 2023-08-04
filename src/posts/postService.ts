import Post from './post'
import PostRepository from './postRepository'

export const addPost = async (userId: string, title: string, body: string) => {
    const post = new Post(userId, title, body)
    await PostRepository.post(post)
    return post
}

export const get = async (id: string) => {
    return await PostRepository.get(id)
}

export const update = async (id: string, userId: string | undefined, title: string | undefined, body: string) => {
    let post = await get(id)
    post.updateDefinedFields(userId, title, body)
    await PostRepository.update(post)
    return post
}

export default {addPost, get, update}