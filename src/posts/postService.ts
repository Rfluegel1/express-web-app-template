import Post from './post'

export const post = (userId: string, title: string, message: string): Post => {
    return new Post(userId, title, message)
}

export default {post}