import CustomError from "./CustomError";


class InvalidError extends CustomError{
  constructor() {
    super({
      message: `Invalid credentials`,
      statusCode: 400,
    });
  }
}

export const createInvalidError = (
): InvalidError => {
  return new InvalidError();
};

export default createInvalidError;
