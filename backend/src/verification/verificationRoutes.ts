import express from 'express'
import VerificationController from './verificationController';

const router = express.Router()

let verificationController = new VerificationController()
router.get('/verify-email', verificationController.verifyEmail.bind(verificationController))
router.post('/send-verification-email', verificationController.sendVerificationEmail.bind(verificationController))
router.post('/request-password-reset', verificationController.requestPasswordReset.bind(verificationController))
router.post('/send-email-update-email', verificationController.sendEmailUpdateEmail.bind(verificationController))
router.put('/reset-password', verificationController.resetPassword.bind(verificationController))
router.get('/update-email', verificationController.updateEmail.bind(verificationController))

export = router