import {StatusCodes} from 'http-status-codes'
import * as fs from 'fs'
import {DataSource} from 'typeorm'
import * as path from 'path'
import axios from 'axios'

const dataSource = new DataSource({
    'type': 'postgres',
    'host': 'localhost',
    'port': 5432,
    'username': 'reidfluegel',
    'password': 'asd',
    'database': 'post',
    'synchronize': true,
    'entities': [
        'src/entity/**/*.ts'
    ]
})

async function createPostsTable() {
    const sql = fs.readFileSync(
        path.join(__dirname, '../../src/migrations.sql'),
        'utf8'
    )
    await dataSource.initialize()
    try {
        await dataSource.query(sql)
    } catch (error) {
        if (error.message !== 'relation "posts" already exists') {
            throw error
        }
    }
}

beforeAll(async () => {
    await createPostsTable()
})

afterAll(async () => {
    await dataSource.destroy()
})

describe('Health check resource', () => {
    it('should return happy if database connection is healthy and requests are being served', async () => {
        // when
        const getResponse = await axios.get(`http://127.0.0.1:8080/health-check`)

        // then
        expect(getResponse.status).toEqual(StatusCodes.OK)
        let getData = getResponse.data
        expect(getData.database).toEqual('connected')
        expect(getData.request).toEqual('serving')
    })
})
