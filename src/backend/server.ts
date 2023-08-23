import http from 'http'
import express, {Express, Request, Response} from 'express'
import morgan from 'morgan'
import postRoutes from './posts/postRoutes'
import healthCheckRoutes from './healthCheck/healthCheckRoutes'
import heartbeatRoutes from './heartbeat/heartbeatRoutes'
import PostRepository from './posts/postRepository'
import PostController from './posts/postController'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from './notFoundException'
import {BadRequestException} from './badRequestException'

const app: Express = express()

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization')
    response.header('Access-Control-Allow-Methods', 'GET,PATCH,DELETE,POST')
    if (request.method === 'OPTIONS') {
        return response.status(200).send({})
    }
    next()
})

app.use('/', postRoutes)
app.use('/', healthCheckRoutes)
app.use('/', heartbeatRoutes)

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
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: 'Internal Server Error'})
}).bind(PostController))

const httpServer = http.createServer(app)
const PORT: any = process.env.PORT ?? 8080

let postRepository: PostRepository = new PostRepository()
postRepository.initialize()
    .then(() => httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`)))
    .catch(error => {
        console.error('Failed to connect to the database', error)
        process.exit(1)
    })

export default httpServer