import {v4 as uuidv4} from 'uuid'
import {plainToClass} from 'class-transformer'

export default class Post {
    id: string = uuidv4()
    body: string
    title: string
    userId: string

    constructor(userId: string = '', title: string = '', body: string = '') {
        this.body = body
        this.title = title
        this.userId = userId
    }

    updateDefinedFields(userId: string, title: string, body: string): void {
        if (userId !== undefined) {
            this.userId = userId
        }
        if (title !== undefined) {
            this.title = title
        }
        if (body !== undefined) {
            this.body = body
        }
    }

    postMapper(queryResult: any): Post {
        const intermediate = {
            id: queryResult?.id,
            userId: queryResult?.userid,
            title: queryResult?.title,
            body: queryResult?.body
        }
        return plainToClass(Post, intermediate)
    }

}