import {createConnection, getConnection} from 'typeorm'
import Post from './post'
import {plainToClass} from 'class-transformer'

const initialize = async () => {
    await createConnection()
}
const post = async (post: Post) => {
    await getConnection().query(
        'INSERT INTO ' +
        'posts (id, userId, title, body) ' +
        'VALUES ($1, $2, $3, $4)',
        [post.id, post.userId, post.title, post.body]
    )
}

const get = async (id: string) => {
    const postResponse = await getConnection().query(
        'SELECT * FROM posts WHERE id=$1', [id]
    )
    const intermediate = {
        id: postResponse[0]?.id,
        userId: postResponse[0]?.userid,
        title: postResponse[0]?.title,
        body: postResponse[0]?.body
    }
    return plainToClass(Post, intermediate)
}

const update = async (post: Post) => {
    await getConnection().query(
        'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
        [post.userId, post.title, post.body, post.id]
    )
}

export default {initialize, post, get, update}