import express, {Express, Request, Response} from 'express'
import healthCheckRoutes from './healthCheck/healthCheckRoutes'
import heartbeatRoutes from './heartbeat/heartbeatRoutes'
import {StatusCodes} from 'http-status-codes'
import {NotFoundException} from './exceptions/NotFoundException'
import {BadRequestException} from './exceptions/BadRequestException'
import path from 'path'
import {DatabaseException} from './exceptions/DatabaseException'
import {getLogger, logger} from './Logger'
import {v4} from 'uuid'
import UserController from './users/userController'

import cls from 'cls-hooked'
import todoRoutes from './todos/todoRoutes'
import userRoutes from './users/userRoutes'
import UserRepository from './users/userRepository'
import passport from 'passport'
import User from './users/User'
import passportRoutes from './passportRoutes'
import session from 'express-session'
import cors from 'cors';
import {UnauthorizedException} from './exceptions/UnauthorizedException'

const namespace = cls.createNamespace('global')
let LocalStrategy = require('passport-local')

const app: Express = express()

import PgSession from 'connect-pg-simple';
import verificationRoutes from './verification/verificationRoutes'

const pgSession = PgSession(session)

const sessionStore = new pgSession({
    conString: `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}/${process.env.DB_DATABASE}`,
    createTableIfMissing: true,
    tableName: 'sessions',
});

app.use(session({
    store: sessionStore,
    secret: process.env.PASSPORT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}))
app.use(passport.authenticate('session'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true
}));
app.use((request, response, next) => {
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (request.method === 'OPTIONS') {
        return response.status(200).send({})
    }
    const requestId: any = v4()
    namespace.run(() => {
        namespace.set('logger', logger.child({requestId}))
        next()
    })
})

let userRepository: UserRepository = new UserRepository()
passport.use(new LocalStrategy(
    async (email: string, password: string, done: any) => {
        try {
            const user = await userRepository.getUserByEmail(email)
            if (!user) {
                getLogger().info(`User not found for email=${email}`)
                return done(new UnauthorizedException('log in'))
            }
            if (!await user.isValidPassword(password)) {
                getLogger().info(`Invalid password for email=${email}`)
                return done(new UnauthorizedException('log in'))
            }
            getLogger().info(`User authenticated for email=${email}`)
            return done(null, user)
        } catch (err) {
            if (err instanceof NotFoundException) {
                return done(new UnauthorizedException('log in'))
            }
            return done(err)
        }
    }
))


passport.serializeUser((user, done) => {
    // Storing user id in the session
    process.nextTick(() => done(null, (user as User).id))
})

passport.deserializeUser(async (id: string, done) => {
    process.nextTick(async () => {
        try {
            const user = await userRepository.getUser(id) // Fetch user from database
            done(null, user)
        } catch (err) {
            done(err, null)
        }
    })
})

// Serve static files from the React app
console.log('static path:', path.join(__dirname, '../build'))
app.use(express.static(path.join(__dirname, '../build')))

app.use('/api', passportRoutes)
app.use('/api', todoRoutes)
app.use('/api', userRoutes)
app.use('/api', verificationRoutes)
app.use('/', healthCheckRoutes)
app.use('/', heartbeatRoutes)

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use((request, response, next) => {
    const error: Error = new Error(`Path not found for url=${request.url}`)
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
    if (error instanceof UnauthorizedException) {
        getLogger().error(errorWithStatus)
        return response.status(StatusCodes.UNAUTHORIZED).send({message: error.message})
    }
    getLogger().error(errorWithStatus)
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: 'Generic Internal Server Error'})
}).bind(UserController))

export default app