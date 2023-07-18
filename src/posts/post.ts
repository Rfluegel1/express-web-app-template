import {v4 as uuidv4} from 'uuid'

export default class Post {
    userId
    id
    title
    body

    constructor(userId = '', title = '', body = '') {
        this.userId = userId
        this.id = uuidv4()
        this.title = title
        this.body = body
    }
}