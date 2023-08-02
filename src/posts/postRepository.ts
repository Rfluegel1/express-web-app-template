import {createConnection, getConnection} from 'typeorm'
import Post from './post'
import {plainToClass} from 'class-transformer'

const post = async (post: Post) => {
    await createConnection()
    getConnection().query(
        'INSERT INTO ' +
        'posts (id, userId, title, body) ' +
        'VALUES ($1, $2, $3, $4)',
        [post.id, post.userId, post.title, post.body]
    )
}

const get = async (id: string) => {
    await createConnection()
    const postResponse = getConnection().query(
        'SELECT FROM posts WHERE id=$1', [id]
    )
    return plainToClass(Post, postResponse)
}

export default {post, get}