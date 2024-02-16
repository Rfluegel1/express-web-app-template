import { NextFunction, Request, Response } from 'express';
import VerificationService from './verificationService';
import { getLogger } from '../Logger';
import User from '../users/User';
import { StatusCodes } from 'http-status-codes';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';
import { BadRequestException } from '../exceptions/BadRequestException';

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

	async sendPasswordResetEmail(request: Request, response: Response, next: NextFunction) {
		if (!request.isAuthenticated()) {
			next(new UnauthorizedException('send password reset email'))
			return
		}
		const userId = (request.user as User).id;
		getLogger().info(`Received send password reset email request for user id=${userId}`);
		try {
			await this.verificationService.sendPasswordResetEmail(userId);
			getLogger().info(`Successful send password reset email request for user id=${userId}`);
			response.status(StatusCodes.CREATED).send();
		} catch (error) {
			next(error);
		}
	}

	async resetPassword(request: Request, response: Response, next: NextFunction) {
		const token = request.query.token as string;
		const password = request.body.password;
		const confirmPassword = request.body.confirmPassword;
		if (password !== confirmPassword) {
			next(new BadRequestException());
			return
		}
		getLogger().info(`Received reset password request for token=${token}`);
		try {
			await this.verificationService.resetPassword(token, password);
			getLogger().info(`Successful reset password request for token=${token}`);
			response.status(StatusCodes.OK).send();
		} catch (error) {
			next(error);
		}
	}

	async sendEmailUpdateEmail(request: Request, response: Response, next: NextFunction) {
		if (!request.isAuthenticated()) {
			next(new UnauthorizedException('send email update email'))
			return
		}
		const userId = (request.user as User).id;
		const email = request.body.email;
		getLogger().info(`Received send email update email request for user id=${userId}`);
		try {
			await this.verificationService.sendEmailUpdateEmail(userId, email);
			getLogger().info(`Successful send email update email request for user id=${userId}`);
			response.status(StatusCodes.CREATED).send();
		} catch (error) {
			next(error);
		}
	}

	async updateEmail(request: Request, response: Response, next: NextFunction) {
		const token = request.query.token as string;
		getLogger().info(`Received update email request for token=${token}`);
		try {
			await this.verificationService.updateEmail(token);
			getLogger().info(`Successful update email request for token=${token}`);
			response.status(StatusCodes.OK).send();
		} catch (error) {
			next(error);
		}
	}
}
