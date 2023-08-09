import {createConnection, getConnection} from 'typeorm'
import Post from './post'
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
        const queryResult = await getConnection().query(
            'SELECT * FROM posts WHERE id=$1', [id]
        )
        if (queryResult.length === 0) {
            throw new NotFoundException(id)
        }
        return new Post().postMapper(queryResult[0])
    }

    async getAll(): Promise<Post[]> {
        const queryResults = await getConnection().query('SELECT * FROM posts')
        return queryResults.map((queryResult: QueryResult) => {
            return new Post().postMapper(queryResult)
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