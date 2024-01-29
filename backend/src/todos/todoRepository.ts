import Todo from './Todo'
import {NotFoundException} from '../exceptions/notFoundException'
import {dataSource} from '../postDataSource'
import {DataSource} from 'typeorm'
import {DatabaseException} from '../exceptions/DatabaseException'
import {getLogger} from '../Logger'

interface QueryResult {
    id: string;
    task: string;
    createdby: string;
}
export default class TodoRepository {
    todoDataSource: DataSource = dataSource

    async initialize(): Promise<void> {
        await this.executeWithCatch(() => this.todoDataSource.initialize())
    }

    async destroy(): Promise<void> {
        await this.executeWithCatch(() => this.todoDataSource.destroy())
    }

    async createTodo(todo: Todo): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoDataSource.query(
                'INSERT INTO ' +
                'todos (id, task, createdBy) ' +
                'VALUES ($1, $2, $3)',
                [todo.id, todo.task, todo.createdBy]
            )
        })
    }

    async deleteTodo(id: string): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoDataSource.query(
                'DELETE FROM todos WHERE id=$1',
                [id]
            )
        })
    }

    async getTodo(id: string): Promise<Todo> {
        const result = await this.executeWithCatch(async () => {
            const queryResult = await this.todoDataSource.query(
                'SELECT * FROM todos WHERE id=$1', [id]
            )
            if (queryResult.length === 0) {
                return null
            }
            return new Todo().todoMapper(queryResult[0])
        })

        if (result === null) {
            throw new NotFoundException(id)
        }
        return result
    }

    async getTodosByCreatedBy(createdBy: string): Promise<Todo[]> {
        return this.executeWithCatch(async () => {
            const queryResults = await this.todoDataSource.query(
                'SELECT * FROM todos WHERE createdBy=$1',
                [createdBy]
            )
            return queryResults.map((queryResult: QueryResult) => {
                return new Todo().todoMapper(queryResult)
            })
        })
    }

    async updateTodo(todo: Todo): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoDataSource.query(
                'UPDATE todos SET task=$1, createdBy=$2 WHERE id=$3',
                [todo.task, todo.createdBy, todo.id]
            )
        })
    }

    async executeWithCatch(action: () => Promise<any>): Promise<any> {
        try {
            return await action()
        } catch (error) {
            getLogger().error(error)
            throw new DatabaseException()
        }
    }
}