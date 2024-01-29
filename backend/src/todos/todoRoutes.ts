import express from 'express'
import TodoController from './todoController'

const router = express.Router()

let todoController = new TodoController()
router.get('/todos', todoController.getTodosByCreatedBy.bind(todoController))
router.get('/todos/:id', todoController.getTodo.bind(todoController))
router.put('/todos/:id', todoController.updateTodo.bind(todoController))
router.delete('/todos/:id', todoController.deleteTodo.bind(todoController))
router.post('/todos', todoController.createTodo.bind(todoController))

export = router