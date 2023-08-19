import {DataSource, QueryFailedError} from 'typeorm'
import fs from 'fs'
import path from 'path'

const dataSource: DataSource = new DataSource({
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
    const sql: string = fs.readFileSync(
        path.join(__dirname, '../src/migrations.sql'),
        'utf8'
    )
    await dataSource.initialize()
    try {
        await dataSource.query(sql)
    } catch (error) {
        if (error instanceof QueryFailedError && error.message !== 'relation "posts" already exists') {
            throw error
        }
    }
}


module.exports = function () {
    beforeAll(async () => {
        await createPostsTable()
    })

    afterAll(async () => {
        await dataSource.destroy()
    })
}