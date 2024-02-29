import { NextFunction, Request, Response } from 'express';
import { BadRequestException } from './exceptions/BadRequestException';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from './logger';
import { NotFoundException } from './exceptions/NotFoundException';
import { DatabaseException } from './exceptions/DatabaseException';
import { DuplicateRowException } from './exceptions/DuplicateRowException';
import { UnauthorizedException } from './exceptions/UnauthorizedException';
import sanitizeHtml from 'sanitize-html';

export const UUID_REG_EXP = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export function validateRequest(request: Request, next: NextFunction, validationSchema: any) {
	let bodyValidations = validationSchema.validate(request.body);
	let queryValidations = validationSchema.validate(request.query);
	let paramsValidation = validationSchema.validate(request.params);
	let error = bodyValidations.error || queryValidations.error || paramsValidation.error;
	if (error) {
		next(new BadRequestException(error.message));
	}
}
export function determineAndSendError() {
	return function(error: any, request: Request, response: Response, next: any) {
		let errorWithStatus = {
			message: error.message,
			name: error.name,
			stack: error.stack,
			status: StatusCodes.INTERNAL_SERVER_ERROR
		};
		if (error.message === 'Path not found') {
			errorWithStatus.status = StatusCodes.NOT_FOUND;
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.NOT_FOUND).send({ message: error.message });
		}
		if (error instanceof NotFoundException) {
			errorWithStatus.status = StatusCodes.NOT_FOUND;
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.NOT_FOUND).send({ message: error.message });
		}
		if (error instanceof BadRequestException) {
			errorWithStatus.status = StatusCodes.BAD_REQUEST;
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.BAD_REQUEST).send({ message: error.message });
		}
		if (error instanceof DatabaseException) {
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: error.message });
		}
		if (error instanceof DuplicateRowException) {
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.CONFLICT).send({ message: error.message });
		}
		if (error instanceof UnauthorizedException) {
			getLogger().error(errorWithStatus);
			return response.status(StatusCodes.UNAUTHORIZED).send({ message: error.message });
		}
		getLogger().error(errorWithStatus);
		return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Generic Internal Server Error' });
	};
}

export function checkForHtml() {
	return (value: string) => {
		const sanitizedValue = sanitizeHtml(value);
		if (value !== sanitizedValue) {
			throw new BadRequestException('Invalid task');
		}
		return sanitizedValue;
	};
}