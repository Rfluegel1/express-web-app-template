import express from 'express'
import UserController from './userController'

const router = express.Router()

let userController = new UserController()
router.get('/users/:id', userController.getUser.bind(userController))
router.put('/users/:id', userController.updateUser.bind(userController))
router.get('/users', userController.getUserByEmail.bind(userController))
router.delete('/users/:id', userController.deleteUser.bind(userController))
router.post('/users', userController.createUser.bind(userController))

export = router