import {StatusCodes} from 'http-status-codes'
import * as fs from 'fs'
import {DataSource} from 'typeorm'
import {ChildProcessWithoutNullStreams, spawn} from 'child_process'
import * as path from 'path'

const axios = require('axios')

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
let server: ChildProcessWithoutNullStreams

function createPostsTable() {
    const sql = fs.readFileSync(
        path.join(__dirname, '../src/migrations.sql'),
        'utf8'
    )
    dataSource.initialize()
        .then(() => dataSource.query(sql))
        .catch(error => {
            if (error.message !== 'relation "posts" already exists') {
                throw error
            }
        })
}

function startBackend(done: jest.DoneCallback) {
    server = spawn('npm', ['run', 'dev'])
    server.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('The server is running on port 8080')) {
            done()
        }
    })
}

beforeAll((done: jest.DoneCallback) => {
    createPostsTable()
    startBackend(done)
})

afterAll((done: jest.DoneCallback) => {
    dataSource.destroy()
        .then(() => {
            server.kill('SIGTERM')
            server.on('exit', () => {
                done()
            })
        })
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
