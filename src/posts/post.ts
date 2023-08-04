import {v4 as uuidv4} from 'uuid'

export default class Post {
    id
    body
    title
    userId

    constructor(userId = '', title = '', body = '') {
        this.id = uuidv4()
        this.body = body
        this.title = title
        this.userId = userId
    }

    updateDefinedFields(userId: string | undefined, title: string | undefined, body: string) {
        if (userId != undefined) {
            this.userId = userId
        }
        if (title != undefined) {
            this.title = title
        }
        if (body != undefined) {
            this.body = body
        }
    }
}