import {DataSource} from 'typeorm'
import Post from './post'
import {NotFoundException} from '../notFoundException'

interface QueryResult {
    id: string;
    userid: string; // Note that this matches the query result; adjust as needed
    title: string;
    body: string;
}

const dataSource = new DataSource({
    'type': 'postgres',
    'host': 'localhost',
    'port': 5432,
    'username': 'reidfluegel',
    'password': '',
    'database': 'post',
    'synchronize': true,
    'entities': [
        'src/entity/**/*.ts'
    ]
})
export default class PostRepository {
    postDataSource = dataSource

    async initialize() {
        await this.postDataSource.initialize()
    }

    async post(post: Post) {
        await this.postDataSource.query(
            'INSERT INTO ' +
            'posts (id, userId, title, body) ' +
            'VALUES ($1, $2, $3, $4)',
            [post.id, post.userId, post.title, post.body]
        )
    }

    async get(id: string) {
        const queryResult = await this.postDataSource.query(
            'SELECT * FROM posts WHERE id=$1', [id]
        )
        if (queryResult.length === 0) {
            throw new NotFoundException(id)
        }
        return new Post().postMapper(queryResult[0])
    }

    async getAll(): Promise<Post[]> {
        const queryResults = await this.postDataSource.query('SELECT * FROM posts')
        return queryResults.map((queryResult: QueryResult) => {
            return new Post().postMapper(queryResult)
        })
    }

    async update(post: Post) {
        await this.postDataSource.query(
            'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
            [post.userId, post.title, post.body, post.id]
        )
    }

    async del(id: string) {
        await this.postDataSource.query(
            'DELETE FROM posts WHERE id=$1',
            [id]
        )
    }
}