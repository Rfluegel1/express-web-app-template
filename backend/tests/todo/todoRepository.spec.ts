import TodoRepository from '../../src/todos/todoRepository'
import {v4 as uuidv4} from 'uuid'
import Todo from '../../src/todos/Todo'
import {NotFoundException} from '../../src/exceptions/notFoundException'

// setup
jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        initialize: jest.fn(),
        destroy: jest.fn()
    })),
}))
jest.mock('../../src/Logger', () => ({
    getLogger: jest.fn(() => {
        return {
            error: jest.fn()
        }
    })
}))

const repository = new TodoRepository()
beforeEach(() => {
    repository.todoDataSource.query = jest.fn()
    repository.todoDataSource.initialize = jest.fn()
    repository.todoDataSource.destroy = jest.fn()
})

describe('Todo repository', () => {
    it('initialize should initialize todoDataSource', async () => {
        //when
        await repository.initialize()
        //then
        expect(repository.todoDataSource.initialize).toHaveBeenCalled()
    })
    it('initialize should log actual error and throw db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.initialize as jest.Mock).mockRejectedValue(error)
        // expect
        await expect(repository.initialize()).rejects.toThrow('Error interacting with the database')
    })
    it('destroy should destroy todoDataSource', async () => {
        //when
        await repository.destroy()
        //then
        expect(repository.todoDataSource.destroy).toHaveBeenCalled()
    })
    it('destroy should log actual error and throws db error', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.destroy as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.destroy()).rejects.toThrow('Error interacting with the database')
    })
    it('createTodo inserts into todoDataSource', async () => {
        //given
        const todo = new Todo('the task', 'the createdBy')
        // when
        await repository.createTodo(todo)
        // then
        expect(repository.todoDataSource.query).toHaveBeenCalledWith(
            'INSERT INTO' +
            ' todos (id, task, createdBy) ' +
            'VALUES ($1, $2, $3)',
            [todo.id, 'the task', 'the createdBy']
        )
    })
    it('createTodo logs error and throws database exception', async () => {
        //given
        let error = new Error('DB Error');
        (repository.todoDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.createTodo(new Todo())).rejects.toThrow('Error interacting with the database')
    })
    it('getTodo selects from todoDataSource', async () => {
        //given
        const id = uuidv4();
        (repository.todoDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM todos WHERE id=$1' && parameters[0] === id) {
                return [{id: id, task: 'the task', createdby: 'the createdBy'}]
            }
        }))
        // when
        const actual = await repository.getTodo(id)
        // then
        expect(actual).toBeInstanceOf(Todo)
        expect(actual.id).toEqual(id)
        expect(actual.task).toEqual('the task')
        expect(actual.createdBy).toEqual('the createdBy')
    })
    it('getTodo logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getTodo(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('getTodo throws not found when query result is empty', async () => {
        //given
        (repository.todoDataSource.query as jest.Mock).mockImplementation(jest.fn(() => {
            return []
        }))
        // when and then
        await expect(() => repository.getTodo(uuidv4())).rejects.toThrow(NotFoundException)
    })
    it('getTodosByCreatedBy selects from todoDataSource', async () => {
        //given
        const id1 = uuidv4()
        const id2 = uuidv4()
        const mockTodo1 = {id: id1, task: 'the task1', createdby: 'the createdBy'}
        const mockTodo2 = {id: id2, task: 'the task2', createdby: 'the createdBy'};
        (repository.todoDataSource.query as jest.Mock).mockImplementation(jest.fn((query, parameters) => {
            if (query === 'SELECT * FROM todos WHERE createdBy=$1' && parameters[0] === 'the createdBy') {
                return [mockTodo1, mockTodo2]
            }
        }))

        // when
        const actual = await repository.getTodosByCreatedBy('the createdBy')
        // then
        expect(actual.length).toEqual(2)
        expect(actual[0]).toBeInstanceOf(Todo)
        expect(actual[0].id).toEqual(id1)
        expect(actual[0].task).toEqual('the task1')
        expect(actual[0].createdBy).toEqual('the createdBy')
        expect(actual[1]).toBeInstanceOf(Todo)
        expect(actual[1].id).toEqual(id2)
        expect(actual[1].task).toEqual('the task2')
        expect(actual[1].createdBy).toEqual('the createdBy')
    })
    it('getTodosByCreatedBy logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.getTodosByCreatedBy('asd')).rejects.toThrow('Error interacting with the database')
    })
    it('deleteTodo deletes from todoDataSource', async () => {
        //given
        const id = uuidv4()
        // when
        await repository.deleteTodo(id)
        // then
        expect(repository.todoDataSource.query).toHaveBeenCalledWith(
            'DELETE FROM todos WHERE id=$1',
            [id]
        )
    })
    it('deleteTodo logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.deleteTodo(uuidv4())).rejects.toThrow('Error interacting with the database')
    })
    it('updateTodo updates todo in todoDataSource', async () => {
        //given
        repository.todoDataSource.query = jest.fn()
        const mockTodo = new Todo('the new task', 'the new createdBy')
        // when
        await repository.updateTodo(mockTodo)
        // then
        expect(repository.todoDataSource.query).toHaveBeenCalledWith(
            'UPDATE todos SET task=$1, createdBy=$2 WHERE id=$3',
            ['the new task', 'the new createdBy', mockTodo.id]
        )
    })
    it('updateTodo logs error and throws database exception', async () => {
        // given
        let error = new Error('DB Error');
        (repository.todoDataSource.query as jest.Mock).mockRejectedValue(error)
        //expect
        await expect(repository.updateTodo(new Todo())).rejects.toThrow('Error interacting with the database')
    })
})
