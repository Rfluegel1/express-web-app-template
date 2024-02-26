import express from 'express';
import passport from 'passport';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/session-check', (req, res, next) => {
	res.status(StatusCodes.OK).send({ sessionActive: req.isAuthenticated() });
});

router.post('/logout', (req, res, next) => {
	req.logout(function(err) {
		if (err) {
			return next(err);
		}
		res.redirect('/login');
	});
});
export = router;