import { DataSource } from 'typeorm';
import Todo from './todos/Todo';
import User from './users/User';

export const dataSource: DataSource = new DataSource({
	'type': 'postgres',
	'host': process.env.DB_HOSTNAME,
	'port': 5432,
	'username': process.env.DB_USERNAME,
	'password': process.env.DB_PASSWORD,
	'database': process.env.DB_DATABASE,
	'synchronize': false,
	'entities': [
		'src/entity/**/*.ts',
		Todo,
		User
	],
	migrations: [
		'src/migrations/*.ts'
	],
	migrationsRun: true
});