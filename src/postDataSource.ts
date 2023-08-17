import {DataSource} from 'typeorm'

export const dataSource: DataSource = new DataSource({
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