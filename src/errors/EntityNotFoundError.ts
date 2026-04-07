import CustomError from "./CustomError";

type ErrorCode = "ERR_NF" | "ERR_VALID";

class EntityNotFoundError extends CustomError<ErrorCode> {
  constructor(entity: string = "Entity") {
    super({
      message: `${entity} not found`,
      statusCode: 404,
      code: "ERR_NF",
    });
  }
}

export const createEntityNotFoundError = (
  entity: string = "Entity",
): EntityNotFoundError => {
  return new EntityNotFoundError(entity);
};

export default createEntityNotFoundError;
