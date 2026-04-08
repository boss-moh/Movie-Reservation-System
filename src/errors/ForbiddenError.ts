import CustomError from "./CustomError";

class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden: You do not have permission to access this resource') {
    super({
      message,
      statusCode: 403,
    });
  }
}

export const createForbiddenError = (
  message: string = 'Forbidden: You do not have permission to access this resource'
): ForbiddenError => {
  return new ForbiddenError(message);
};

export default createForbiddenError;
