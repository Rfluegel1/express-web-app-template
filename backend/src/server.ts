const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})

import {getLogger} from './Logger'
import http from 'http'
import app from './app'
import passport from 'passport'
import User from './users/User'
import PostRepository from './posts/postRepository'
import UserRepository from './users/userRepository'
const LocalStrategy = require('passport-local').Strategy;

const httpServer = http.createServer(app)
const PORT: any = process.env.PORT ?? 8080

let userRepository: UserRepository = new UserRepository()
let postRepository: PostRepository = new PostRepository()
const logger = getLogger()

postRepository.initialize()
    .then(() => {
        passport.use(new LocalStrategy(
            async (email: string, password: string, done: any) => {
                try {
                    const user = await userRepository.getUserByEmail(email);
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (!await user.isValidPassword(password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));

        passport.serializeUser((user, done) => {
            done(null, (user as User).id); // Storing user id in the session
        });

        passport.deserializeUser(async (id: string, done) => {
            try {
                const user = await userRepository.getUser(id); // Fetch user from database
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });


        httpServer.listen(PORT, () => {
            logger.info(`The server is running on port ${PORT}`)
        })
    })
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