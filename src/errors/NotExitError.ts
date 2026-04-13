import CustomError from "./CustomError";


class NotExitError extends CustomError {
  constructor(filed: string ) {
    super({
      message: `'${filed}' does not exist`,
      statusCode: 404,
    });
  }
}

export const createNotExitError = (
  filed: string= "filed",
): NotExitError => {
  return new NotExitError(filed);
};

export default createNotExitError;
