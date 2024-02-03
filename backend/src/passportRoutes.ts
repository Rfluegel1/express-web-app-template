import express from 'express'
import passport from 'passport'
import {StatusCodes} from 'http-status-codes'

const router = express.Router()

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        try {
            // If there's an error or no user was found, handle it
            if (err) {
                throw err
            }
            if (!user) {
                // You can modify this part to handle how you want to respond when authentication fails
                return res.redirect('/login')
            }

            // Log the user in
            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    throw loginErr
                }
                // Redirect upon successful login
                return res.redirect('/')
            })
        } catch (error) {
            // Handle any exceptions
            next(error)
        }
    })(req, res, next)
})

router.get('/session-check', (req, res, next) => {
    res.status(StatusCodes.OK).send({sessionActive: req.isAuthenticated()})
})
export = router;
