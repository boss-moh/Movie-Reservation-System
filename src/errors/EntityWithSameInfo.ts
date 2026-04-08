import CustomError from "./CustomError";


class EntityWithSameInfoError extends CustomError{
  constructor(info: string, entity: string ) {
    super({
      message: `there are ${entity} with some ${info} already exist`,
      statusCode: 409,
    });
  }
}

export const createEntityWithSameInfoError = (
  info: string= "info",
  entity: string = "Entity",
): EntityWithSameInfoError => {
  return new EntityWithSameInfoError(info, entity);
};

export default createEntityWithSameInfoError;
