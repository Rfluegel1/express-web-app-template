import Post from './post'
import {NotFoundException} from '../exceptions/notFoundException'
import {dataSource} from '../postDataSource'
import {DataSource} from 'typeorm'
import {DatabaseException} from '../exceptions/DatabaseException'

interface QueryResult {
    id: string;
    userid: string; // Note that this matches the query result; adjust as needed
    title: string;
    body: string;
}

export default class PostRepository {
    postDataSource: DataSource = dataSource

    async initialize(): Promise<void> {
        await this.executeWithCatch(() => this.postDataSource.initialize())
    }

    async destroy(): Promise<void> {
        await this.executeWithCatch(() => this.postDataSource.destroy())
    }

    async createPost(post: Post): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.postDataSource.query(
                'INSERT INTO ' +
                'posts (id, userId, title, body) ' +
                'VALUES ($1, $2, $3, $4)',
                [post.id, post.userId, post.title, post.body]
            )
        })
    }

    async deletePost(id: string): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.postDataSource.query(
                'DELETE FROM posts WHERE id=$1',
                [id]
            )
        })
    }

    async getPost(id: string): Promise<Post> {
        const result = await this.executeWithCatch(async () => {
            const queryResult = await this.postDataSource.query(
                'SELECT * FROM posts WHERE id=$1', [id]
            )
            if (queryResult.length === 0) {
                return null
            }
            return new Post().postMapper(queryResult[0])
        })

        if (result === null) {
            throw new NotFoundException(id)
        }
        return result
    }

    async getAllPosts(): Promise<Post[]> {
        return this.executeWithCatch(async () => {
            const queryResults = await this.postDataSource.query('SELECT * FROM posts')
            return queryResults.map((queryResult: QueryResult) => {
                return new Post().postMapper(queryResult)
            })
        })
    }

    async updatePost(post: Post): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.postDataSource.query(
                'UPDATE posts SET userId=$1, title=$2, body=$3 WHERE id=$4',
                [post.userId, post.title, post.body, post.id]
            )
        })
    }

    async executeWithCatch(action: () => Promise<any>): Promise<any> {
        try {
            return await action()
        } catch (error) {
            throw new DatabaseException()
        }
    }
}