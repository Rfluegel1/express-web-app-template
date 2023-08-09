import {createConnection, getConnection} from 'typeorm'
import Post from './post'
import {plainToClass} from 'class-transformer'
import {NotFoundException} from '../notFoundException'

interface QueryResult {
    id: string;
    userid: string; // Note that this matches the query result; adjust as needed
    title: string;
    body: string;
}

export default class PostRepository {

    async initialize() {
        await createConnection()
    }

    async post(post: Post) {
        await getConnection().query(
            'INSERT INTO ' +
            'posts (id, userId, title, body) ' +
            'VALUES ($1, $2, $3, $4)',
            [post.id, post.userId, post.title, post.body]
        )
    }

    async get(id: string) {
        const postResponse = await getConnection().query(
            'SELECT * FROM posts WHERE id=$1', [id]
        )
        if (postResponse.length === 0) {
            throw new NotFoundException(id)
        }
        const intermediate = {
            id: postResponse[0]?.id,
            userId: postResponse[0]?.userid,
            title: postResponse[0]?.title,
            body: postResponse[0]?.body
        }
        return plainToClass(Post, intermediate)
    }

    async getAll(): Promise<Post[]> {
        const queryResults = await getConnection().query('SELECT * FROM posts')
        const convertedList = queryResults.map((result: QueryResult) => {
            return {
                id: result?.id,
                userId: result?.userid,
                title: result?.title,
                body: result?.body
            }
        })
        return convertedList.map((convert: Object) => {
            return plainToClass(Post, convert)
        })
    }

    async update(post: Post) {
        await getConnection().query(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            [post.userId, post.title, post.body, post.id]
        )
    }

    async del(id: string) {
        await getConnection().query(
            'DELETE FROM posts WHERE id=$1',
            [id]
        )
    }
}