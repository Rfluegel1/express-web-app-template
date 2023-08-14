import http from 'http'
import express, {Express, Request, Response} from 'express'
import morgan from 'morgan'
import routes from './posts/postRoutes'
import PostRepository from './posts/postRepository'
import PostController from './posts/postController'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from './notFoundException'
import {BadRequestException} from './badRequestException'

const app: Express = express()

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization')
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST')
        return res.status(200).json({})
    }
    next()
})

app.use('/', routes)

app.use((req, res, next) => {
    const error = new Error('not found')
    next(error)
})

app.use((function (err: any, req: Request, res: Response, next: any) {
    if (err.message === 'not found') {
        return res.status(StatusCodes.NOT_FOUND).json({message: err.message})
    }
    if (err instanceof NotFoundException) {
        return res.status(StatusCodes.NOT_FOUND).json({message: err.message})
    }
    if (err instanceof BadRequestException) {
        return res.status(StatusCodes.BAD_REQUEST).json({message: err.message})
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Internal Server Error'})
}).bind(PostController))

const httpServer = http.createServer(app)
const PORT: any = process.env.PORT ?? 8080

let postRepository = new PostRepository()
postRepository.initialize()
    .then(() => httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`)))
    .catch(err => {
        console.error('Failed to connect to the database', err)
        process.exit(1)
    })

const gracefulShutdown = () => {
    console.log('\nStarting graceful shutdown...')

    httpServer.close(() => {

        postRepository.destroy()
            .then(() => {
                console.log('Server closed.')
                process.exit(0)
            })
    })
}

// Handle different shutdown signals
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

export default httpServer