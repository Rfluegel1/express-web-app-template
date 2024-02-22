import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from './Logger';
import { NotFoundException } from './exceptions/NotFoundException';
import { BadRequestException } from './exceptions/BadRequestException';
import { DatabaseException } from './exceptions/DatabaseException';
import { DuplicateRowException } from './exceptions/DuplicateRowException';
import { UnauthorizedException } from './exceptions/UnauthorizedException';


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