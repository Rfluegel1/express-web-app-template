import express from 'express'
import UserController from './UserController'

const router = express.Router()

let userController = new UserController()
router.get('/users/is-verified', userController.isVerified.bind(userController))
router.get('/users/:id', userController.getUser.bind(userController))
router.put('/users/:id', userController.updateUser.bind(userController))
router.get('/users', userController.getUserByEmail.bind(userController))
router.delete('/users/:id', userController.deleteUser.bind(userController))
router.post('/users', userController.createUser.bind(userController))

export = router