import {DataSource} from 'typeorm'

export const dataSource: DataSource = new DataSource({
    'type': 'postgres',
    'host': process.env.DB_HOSTNAME,
    'port': 5432,
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_DATABASE,
    'synchronize': process.env.DB_SYNCHRONIZE === 'true',
    'entities': [
        'src/entity/**/*.ts'
    ],
    migrations: [
        'src/migrations/*.ts'
    ],
    migrationsRun: true
})