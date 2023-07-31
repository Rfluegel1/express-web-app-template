import {createConnection} from 'typeorm'

const post = (userId: string, title: string, message: string): void => {
    createConnection().then(async connection => {
        console.log('Connected to DB')
    }).catch(error => console.log(error))
}

export default {post}