import http from 'http'
import express, {Express} from 'express'
import morgan from 'morgan'
import routes from './posts/postRoutes'
import PostRepository from './posts/postRepository'
import PostController from './posts/postController'

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

app.use(PostController.errorHandler)

const httpServer = http.createServer(app)
const PORT: any = process.env.PORT ?? 8080

PostRepository.initialize().catch(err => {
    console.error('Failed to connect to the database', err)
    process.exit(1)
})
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`))

export default httpServer