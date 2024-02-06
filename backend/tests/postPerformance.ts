// @ts-ignore
import http from 'k6/http'
// @ts-ignore
import {sleep} from 'k6'

const virtualUsers = 10
export const options = {
    vus: virtualUsers,
    duration: '30s',
    thresholds: {
        'http_req_duration': ['p(95)<100']
    }
}

export default function () {
    const BASE_URL = __ENV.BASE_URL ? __ENV.BASE_URL : 'http://127.0.0.1:8090'
    const postBody = {userId: 'the user', title: 'the title', body: 'the body'}
    const putBody = {userId: 'the new user', title: 'the new title', body: 'the new body'}
    const postResponse = http.post(`${BASE_URL}/api/posts`, postBody)
    const id = JSON.parse(postResponse.body).message.id
    http.get(`${BASE_URL}/api/posts/${id}`)
    http.put(`${BASE_URL}/api/posts/${id}`, putBody)
    http.request('DELETE', `${BASE_URL}/api/posts/${id}`)
    sleep(1)
}
