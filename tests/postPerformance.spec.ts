import http from 'k6/http'
import {sleep} from 'k6'

const virtualUsers = 10
export const options = {
    vus: virtualUsers,
    duration: '30s',
}

export default function () {
    const postBody = {userId: 'the user', title: 'the title', body: 'the message!'}
    const putBody = {userId: 'the new user', title: 'the new title', body: 'the new message!'}
    const postResponse = http.post(`http://127.0.0.1:8080/posts/`, postBody)
    const id = JSON.parse(postResponse.body).message.id
    http.get(`http://127.0.0.1:8080/posts/${id}`)
    http.put(`http://127.0.0.1:8080/posts/${id}`, putBody)
    http.del(`http://127.0.0.1:8080/posts/${id}`)
    sleep(1)
}
