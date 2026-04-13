import CustomError from "./CustomError";


class unauthenticateError extends CustomError {
  constructor() {
    super({
      message: "unauthenticate,you need to login to access this resource ",
      statusCode: 401,
    });
  }
}

export const createunauthenticateError = (
): unauthenticateError => {
  return new unauthenticateError();
};

export default createunauthenticateError;
