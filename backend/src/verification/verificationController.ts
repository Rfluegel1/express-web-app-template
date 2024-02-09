import { NextFunction, Request, Response } from 'express';
import VerificationService from './verificationService';
import { getLogger } from '../Logger';
import User from '../users/User';
import { StatusCodes } from 'http-status-codes';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

export default class VerificationController {
	verificationService = new VerificationService();

	async sendVerificationEmail(request: Request, response: Response, next: NextFunction) {
		if (!request.isAuthenticated()) {
			next(new UnauthorizedException('send email verification'))
			return
		}
		const userId = (request.user as User).id;
		getLogger().info(`Received send verification email request for user id=${userId}`);
		try {
			await this.verificationService.sendVerificationEmail(userId);
			getLogger().info(`Successful send verification email request for user id=${userId}`);
			response.status(StatusCodes.CREATED).send();
		} catch (error) {
			next(error);
		}
	}

	async verifyEmail(request: Request, response: Response, next: NextFunction) {
		const token = request.query.token as string;
		getLogger().info(`Received verify email request for token=${token}`);
		try {
			await this.verificationService.verifyEmail(token);
			getLogger().info(`Successful verify email request for token=${token}`);
			response.status(StatusCodes.OK).send();
		} catch (error) {
			next(error);
		}
	}
}
