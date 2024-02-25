import express, {Express} from 'express'
import healthCheckRoutes from './healthCheck/healthCheckRoutes'
import heartbeatRoutes from './heartbeat/heartbeatRoutes'
import {NotFoundException} from './exceptions/NotFoundException'
import path from 'path'
import {getLogger, logger} from './Logger'
import {v4} from 'uuid'

import cls from 'cls-hooked'
import todoRoutes from './todos/todoRoutes'
import userRoutes from './users/userRoutes'
import UserRepository from './users/UserRepository'
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
import { determineAndSendError } from './determineAndSendError';

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
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))
app.use(passport.authenticate('session'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true
}));

app.set('trust proxy', true);

app.use((request, response, next) => {
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (request.method === 'OPTIONS') {
        return response.status(200).send({})
    }
    const requestId: any = v4()
    const clientIP = request.ip
    namespace.run(() => {
        namespace.set('logger', logger.child({requestId, clientIP}))
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
                return done(new UnauthorizedException('incorrect username or password'))
            }
            if (!await user.isValidPassword(password)) {
                getLogger().info(`Invalid password for email=${email}`)
                return done(new UnauthorizedException('incorrect username or password'))
            }
            getLogger().info(`User authenticated for email=${email}`)
            return done(null, user)
        } catch (err) {
            if (err instanceof NotFoundException) {
                getLogger().error(err.message)
                return done(new UnauthorizedException('incorrect username or password'))
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

app.use(determineAndSendError())

export default app