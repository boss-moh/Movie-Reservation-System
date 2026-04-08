import CustomError from "./CustomError";


class EntityNotFoundError extends CustomError {
  constructor(entity: string = "Entity") {
    super({
      message: `${entity} not found`,
      statusCode: 404,
    });
  }
}

export const createEntityNotFoundError = (
  entity: string = "Entity",
): EntityNotFoundError => {
  return new EntityNotFoundError(entity);
};

export default createEntityNotFoundError;
