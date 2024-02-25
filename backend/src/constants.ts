import { NextFunction, Request } from 'express';
import { BadRequestException } from './exceptions/BadRequestException';

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