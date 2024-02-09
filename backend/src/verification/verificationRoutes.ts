import express from 'express'
import VerificationController from './verificationController';

const router = express.Router()

let verificationController = new VerificationController()
router.get('/verify-email', verificationController.verifyEmail.bind(verificationController))
router.post('/send-verification-email', verificationController.sendVerificationEmail.bind(verificationController))

export = router