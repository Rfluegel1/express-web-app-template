import express, {Express, Request, Response} from 'express'
import postRoutes from './posts/postRoutes'
import healthCheckRoutes from './healthCheck/healthCheckRoutes'
import heartbeatRoutes from './heartbeat/heartbeatRoutes'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from './exceptions/notFoundException'
import {BadRequestException} from './exceptions/badRequestException'
import PostController from './posts/postController'
import path from 'path'
import {DatabaseException} from './exceptions/DatabaseException'
import {getLogger, logger} from './Logger'
import {v4} from 'uuid'
import {auth, requiresAuth} from 'express-openid-connect'

import cls from 'cls-hooked'
import todoRoutes from './todos/todoRoutes'
const namespace = cls.createNamespace('global')


const app: Express = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(auth({
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    secret: process.env.AUTH0_SECRET
}))

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user, null, 2))
})

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization')
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
    if (request.method === 'OPTIONS') {
        return response.status(200).send({})
    }
    const requestId: any = v4()
    namespace.run(() => {
        namespace.set('logger', logger.child({requestId}))
        next()
    })
})

// Serve static files from the React app
console.log('static path:', path.join(__dirname, '../build'))
app.use(express.static(path.join(__dirname, '../build')))

app.use('/api', postRoutes)
app.use('/api', todoRoutes)
app.use('/', healthCheckRoutes)
app.use('/', heartbeatRoutes)

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use((request, response, next) => {
    const error: Error = new Error('Path not found')
    next(error)
})

// next is needed to be properly bound with node
app.use((function (error: any, request: Request, response: Response, next: any) {
    let errorWithStatus = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        status: StatusCodes.INTERNAL_SERVER_ERROR
    }
    if (error.message === 'Path not found') {
        errorWithStatus.status = StatusCodes.NOT_FOUND
        getLogger().error(errorWithStatus)
        return response.status(StatusCodes.NOT_FOUND).send({message: error.message})
    }
    if (error instanceof NotFoundException) {
        errorWithStatus.status = StatusCodes.NOT_FOUND
        getLogger().error(errorWithStatus)
        return response.status(StatusCodes.NOT_FOUND).send({message: error.message})
    }
    if (error instanceof BadRequestException) {
        errorWithStatus.status = StatusCodes.BAD_REQUEST
        getLogger().error(errorWithStatus)
        return response.status(StatusCodes.BAD_REQUEST).send({message: error.message})
    }
    if (error instanceof DatabaseException) {
        getLogger().error(errorWithStatus)
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: error.message})
    }
    getLogger().error(errorWithStatus)
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: 'Generic Internal Server Error'})
}).bind(PostController))

export default app