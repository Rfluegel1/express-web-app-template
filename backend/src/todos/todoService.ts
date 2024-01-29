import Todo from './Todo'
import TodoRepository from './todoRepository'
// import TodoRepository from './todoRepository'


export default class TodoService {
    todoRepository = new TodoRepository()

    async createTodo(task: string, createdBy: string): Promise<Todo> {
        const todo: Todo = new Todo(task, createdBy)
        await this.todoRepository.createTodo(todo)
        return todo
    }

    async deleteTodo(id: string): Promise<void> {
        await this.todoRepository.deleteTodo(id)
    }

    async getTodo(id: string): Promise<Todo> {
        return await this.todoRepository.getTodo(id)
    }

    async getAllTodos(): Promise<Todo[]> {
        // return await this.todoRepository.getAllTodos()
        return [new Todo()]
    }

    async updateTodo(id: string, task: string, createdBy: string): Promise<Todo> {
        let todo: Todo = await this.getTodo(id)
        todo.updateDefinedFields(task, createdBy)
        await this.todoRepository.updateTodo(todo)
        return todo
    }
}