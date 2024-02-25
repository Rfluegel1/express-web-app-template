import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestException } from '../exceptions/BadRequestException';
import { getLogger } from '../Logger';
import UserService from './UserService';
import User from './User';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';
import Joi from 'joi';

export default class UserController {
	userService = new UserService();

	validationSchema = Joi.object({
		id: Joi.string().uuid(),
		email: Joi.string().email(),
		password: Joi.string().max(255),
		confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
			'any.only': '"confirmPassword" must match "password"',
		}),
		isVerified: Joi.boolean(),
		role: Joi.string(),
		pendingEmail: Joi.string().email(),
		passwordReset: Joi.object({
			token: Joi.string().uuid(),
			expiration: Joi.date().iso(),
		}),
		emailUpdate: Joi.object({
			token: Joi.string().uuid(),
			expiration: Joi.date().iso(),
		}),
		emailVerification: Joi.object({
			token: Joi.string().uuid(),
			expiration: Joi.date().iso(),
		}),
	});

	validateRequest(request: Request, next: NextFunction) {
		let bodyValidations = this.validationSchema.validate(request.body);
		let queryValidations = this.validationSchema.validate(request.query);
		let paramsValidation = this.validationSchema.validate(request.params);
		let error = bodyValidations.error || queryValidations.error || paramsValidation.error;
		if (error) {
			next(new BadRequestException(error.message));
		}
	}
	async updateUser(request: Request, response: Response, next: NextFunction) {
		getLogger().info(
			'Received update users request',
			{ requestParam: request.params, requestBody: request.body }
		);
		if ((request.user as User).role !== 'admin') {
			return next(new UnauthorizedException('update user'));
		}
		const id: string = request.params.id;
		const email: string = request.body.email;
		const password: string = request.body.password;
		const emailVerification: { token: string, expiration:string } = request.body.emailVerification;
		const isVerified: boolean = request.body.isVerified;
		const role: string = request.body.role;
		const passwordReset: { token: string, expiration:string } = request.body.passwordReset;
		const emailUpdate: { token: string, expiration:string } = request.body.emailUpdate;
		const pendingEmail: string = request.body.pendingEmail;
		this.validateRequest(request, next);
		try {
			let user: User = await this.userService.updateUser(
				id,
				email,
				password,
				isVerified,
				emailVerification,
				role,
				passwordReset,
				emailUpdate,
				pendingEmail
			);
			getLogger().info('Sending update user request', { status: StatusCodes.OK });
			return response.status(StatusCodes.OK).send(user);
		} catch (error) {
			next(error);
		}
	}

	async createUser(request: Request, response: Response, next: NextFunction) {
		let email: string = request.body.email;
		getLogger().info('Received create users request', { requestBody: { email: email } });
		let password: string = request.body.password;
		this.validateRequest(request, next);
		try {
			const user: User = await this.userService.createUser(email, password);
			getLogger().info('Sending create users response', { status: StatusCodes.CREATED });
			return response.status(StatusCodes.CREATED).send({
				id: user.id, email: user.email, isVerified: user.isVerified
			});
		} catch (error) {
			next(error);
		}
	}

	async deleteUser(request: Request, response: Response, next: NextFunction) {
		getLogger().info('Received delete users request', { requestParam: request.params });
		let id: string = request.params.id;
		if (!request.isAuthenticated() || (request.user as User).id !== id && (request.user as User).role !== 'admin') {
			return next(new UnauthorizedException('delete user'));
		}
		this.validateRequest(request, next);
		try {
			await this.userService.deleteUser(id);
			getLogger().info('Sending delete users response', { status: StatusCodes.NO_CONTENT });
			return response.sendStatus(StatusCodes.NO_CONTENT);
		} catch (error) {
			next(error);
		}
	}

	async getUser(request: Request, response: Response, next: NextFunction) {
		getLogger().info('Received get users request', { requestParam: request.params });
		let id: string = request.params.id;
		const isAdmin = (request.user as User).role === 'admin';
		if (!request.isAuthenticated() || (request.user as User).id !== id && !isAdmin) {
			return next(new UnauthorizedException('get user'));
		}
		let user: User;
		this.validateRequest(request, next);
		try {
			user = await this.userService.getUser(id);
			getLogger().info('Sending get users response', { status: StatusCodes.OK });
			return response.status(StatusCodes.OK).send(isAdmin
				? user
				: { id: user.id, email: user.email, isVerified: user.isVerified }
			);
		} catch (error) {
			next(error);
		}
	}

	async getUserByEmail(request: Request, response: Response, next: NextFunction) {
		getLogger().info('Received get user by email request', { requestQuery: request.query });
		let email: string = request.query.email as string;
		if (!request.isAuthenticated() || (request.user as User).email !== email && (request.user as User).role !== 'admin') {
			return next(new UnauthorizedException('get user by email'));
		}
		let user: User;
		this.validateRequest(request, next);
		try {
			user = await this.userService.getUserByEmail(email);
			getLogger().info('Sending get users response', { status: StatusCodes.OK });
			return response.status(StatusCodes.OK).send({
				id: user.id, email: user.email, isVerified: user.isVerified
			});
		} catch (error) {
			next(error);
		}
	}
}