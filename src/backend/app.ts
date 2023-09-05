import express, {Express, Request, Response} from 'express'
import morgan from 'morgan'
import postRoutes from './posts/postRoutes'
import healthCheckRoutes from './healthCheck/healthCheckRoutes'
import heartbeatRoutes from './heartbeat/heartbeatRoutes'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from './exceptions/notFoundException'
import {BadRequestException} from './exceptions/badRequestException'
import PostController from './posts/postController'
import path from 'path'
import {DatabaseException} from './exceptions/DatabaseException'
import {logger} from './Logger'
import {v4} from 'uuid'

const cls = require('cls-hooked')
const namespace = cls.createNamespace('global')


const app: Express = express()

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization')
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
    const requestId: any = v4()
    if (request.method === 'OPTIONS') {
        return response.status(200).send({})
    }
    namespace.run(() => {
        namespace.set('logger', logger.child({requestId}))
        next()
    })
})

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/../../dist')))

app.use('/api', postRoutes)
app.use('/', healthCheckRoutes)
app.use('/', heartbeatRoutes)

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../../dist/index.html'))
})

app.use((request, response, next) => {
    const error: Error = new Error('not found')
    next(error)
})

// next is needed to be properly bound with node
app.use((function (error: any, request: Request, response: Response, next: any) {
    if (error.message === 'not found') {
        return response.status(StatusCodes.NOT_FOUND).send({message: error.message})
    }
    if (error instanceof NotFoundException) {
        return response.status(StatusCodes.NOT_FOUND).send({message: error.message})
    }
    if (error instanceof BadRequestException) {
        return response.status(StatusCodes.BAD_REQUEST).send({message: error.message})
    }
    if (error instanceof DatabaseException) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: error.message})
    }
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: 'Generic Internal Server Error'})
}).bind(PostController))

export default app