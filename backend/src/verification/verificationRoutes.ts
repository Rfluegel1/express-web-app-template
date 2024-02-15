import express from 'express'
import VerificationController from './verificationController';

const router = express.Router()

let verificationController = new VerificationController()
router.get('/verify-email', verificationController.verifyEmail.bind(verificationController))
router.post('/send-verification-email', verificationController.sendVerificationEmail.bind(verificationController))
router.post('/send-password-reset-email', verificationController.sendPasswordResetEmail.bind(verificationController))
router.put('/reset-password', verificationController.resetPassword.bind(verificationController))

export = router