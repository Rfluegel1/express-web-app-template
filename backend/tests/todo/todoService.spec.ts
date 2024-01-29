import TodoService from '../../src/todos/todoService'
import {v4 as uuidv4} from 'uuid'
import {UUID_REG_EXP} from '../../src/contants'
import Todo from '../../src/todos/Todo'

// setup
jest.mock('../../src/todos/todoRepository', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createTodo: jest.fn(),
            deleteTodo: jest.fn(),
            getTodo: jest.fn(),
            getAllTodos: jest.fn(),
            updateTodo: jest.fn()
        }
    })
})

describe('Todo service', () => {
    let service: TodoService = new TodoService()
    it('createTodo should call repository and returns Todo', async () => {
        const expectedTodo = {task: 'the task', createdBy: 'the createdBy'}
        // when
        let result: Todo = await service.createTodo('the task', 'the createdBy')
        // then
        expect(service.todoRepository.createTodo).toHaveBeenCalledWith(expect.objectContaining(expectedTodo))
        expect(result.task).toEqual('the task')
        // expect(result.createdBy).toEqual('the createdBy')
        expect(result.id).toMatch(UUID_REG_EXP)
    })
    it('updateTodo gets from repository, calls repository to update, and returns Todo', async () => {
        //given
        const id: string = uuidv4()
        const expectedTodo = {task: 'the task', createdBy: 'the createdBy'};
        (service.todoRepository.getTodo as jest.Mock).mockImplementation(jest.fn(() => {
            let todo = new Todo()
            todo.id = id
            return todo
        }))
        // when
        let result: Todo = await service.updateTodo(id, 'the task', 'the createdBy')
        // then
        expect(service.todoRepository.updateTodo).toHaveBeenCalledWith(expect.objectContaining(expectedTodo))
        expect(result.task).toEqual('the task')
        expect(result.createdBy).toEqual('the createdBy')
        expect(result.id).toEqual(id)
    })
    it.each`
    task          | createdBy          | expected
    ${undefined}  | ${undefined}       | ${{task: 'old task', createdBy: 'old createdBy'}}
    ${'new task'} | ${'new createdBy'} | ${{task: 'new task', createdBy: 'new createdBy'}}
    `('updateTodo only sets defined fields on updated Todo',
        async ({task, createdBy, expected}) => {
            //given
            const existingTodo = new Todo('old task', 'old createdBy');
            (service.todoRepository.getTodo as jest.Mock).mockImplementation((sentId: string) => {
                if (sentId === existingTodo.id) {
                    return existingTodo
                }
            })
            // when
            let result: Todo = await service.updateTodo(existingTodo.id, task, createdBy)
            // then
            expect(service.todoRepository.updateTodo).toHaveBeenCalledWith(expect.objectContaining(expected))
            expect(result.task).toEqual(expected.task)
            expect(result.createdBy).toEqual(expected.createdBy)
            expect(result.id).toEqual(existingTodo.id)
        })

    it('getTodo returns todos from repository', async () => {
        //given
        const id: string = uuidv4()
        const mockTodo = {id: id, task: 'the task', createdBy: 'the createdBy'};

        (service.todoRepository.getTodo as jest.Mock).mockImplementation((sentId: string) => {
            if (sentId === id) {
                return mockTodo
            }
        })
        // when
        const result: Todo = await service.getTodo(id)
        // then
        expect(result.task).toEqual('the task')
        expect(result.createdBy).toEqual('the createdBy')
        expect(result.id).toEqual(id)
    })
    // it('getAllTodos returns todos from repository', async () => {
    //     //given
    //     const id1: string = uuidv4()
    //     const id2: string = uuidv4()
    //     const mockTodo1: Todo = new Todo('the user', 'the title', 'the body')
    //     const mockTodo2: Todo = new Todo('the user', 'the title', 'the body')
    //     mockTodo1.id = id1
    //     mockTodo2.id = id2;
    //
    //     (service.todoRepository.getAllTodos as jest.Mock).mockImplementation(() => {
    //         return [mockTodo1, mockTodo2]
    //     })
    //     // when
    //     const result: Todo[] = await service.getAllTodos()
    //     // then
    //     expect(result.length).toEqual(2)
    //
    //     let firstTodo = result.find((todo: Todo): boolean => todo.id === id1)
    //     expect(firstTodo).toBeInstanceOf(Todo)
    //     expect(firstTodo?.userId).toEqual('the user')
    //     expect(firstTodo?.title).toEqual('the title')
    //     expect(firstTodo?.body).toEqual('the body')
    //
    //     let secondTodo = result.find((todo: Todo): boolean => todo.id === id2)
    //     expect(secondTodo?.userId).toEqual('the user')
    //     expect(secondTodo?.title).toEqual('the title')
    //     expect(secondTodo?.body).toEqual('the body')
    //     expect(secondTodo?.id).toEqual(id2)
    // })
    it('delete calls to repo', async () => {
        //given
        const id: string = uuidv4()
        // when
        await service.deleteTodo(id)
        // then
        expect(service.todoRepository.deleteTodo).toHaveBeenCalledWith(id)
    })
})
