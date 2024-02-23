import Todo from './Todo'
import {NotFoundException} from '../exceptions/NotFoundException'
import {dataSource} from '../postDataSource'
import {DataSource} from 'typeorm'
import {DatabaseException} from '../exceptions/DatabaseException'
import {getLogger} from '../Logger'

export default class TodoRepository {
    todoDataSource: DataSource = dataSource
    todoRepository = dataSource.getRepository(Todo)

    async initialize(): Promise<void> {
        await this.executeWithCatch(() => this.todoDataSource.initialize())
    }

    async destroy(): Promise<void> {
        await this.executeWithCatch(() => this.todoDataSource.destroy())
    }

    async createTodo(todo: Todo): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoRepository.save(todo)
        })
    }

    async deleteTodo(id: string): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoRepository.delete(id);
        })
    }

    async getTodo(id: string): Promise<Todo> {
        const todo = await this.executeWithCatch(async () => {
            return await this.todoRepository.findOne({ where: { id: id } });
        })
        if (!todo) {
            throw new NotFoundException(id);
        }
        return todo
    }

    async getTodosByCreatedBy(createdBy: string): Promise<Todo[]> {
        return this.executeWithCatch(async () => {
            return await this.todoRepository.find({ where: { createdBy: createdBy } });
        })
    }

    async updateTodo(todo: Todo): Promise<void> {
        await this.executeWithCatch(async () => {
            await this.todoRepository.save(todo);
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