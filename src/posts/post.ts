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
}