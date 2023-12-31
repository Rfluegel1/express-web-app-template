const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})

import {getLogger} from './Logger'
import http from 'http'
import PostRepository from './posts/postRepository'
import app from './app'

const httpServer = http.createServer(app)
const PORT: any = process.env.PORT ?? 8080

let postRepository: PostRepository = new PostRepository()
const logger = getLogger()
postRepository.initialize()
    .then(() => httpServer.listen(PORT, () => {
        logger.info(`The server is running on port ${PORT}`)
    }))
    .catch(error => {
        logger.error('Failed to connect to the database', error)
        process.exit(1)
    })

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...')
    httpServer.close(async () => {
        await postRepository.destroy()
        logger.info('Closed all connections')
        process.exit(0)
    })

    // Force close server after 5 secs
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down')
        process.exit(1)
    }, 5000)
}

// Handle SIGTERM and SIGINT signals (Ctrl+C, termination, etc.)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start listening
export default httpServer