import {v4 as uuidv4} from 'uuid'

export default class Post {
    userId: String
    id: String
    title: String
    body: String

    constructor(userId: String = '', title: String = '', body: String = '') {
        this.userId = userId;
        this.id = uuidv4();
        this.title = title;
        this.body = body;
    }
}