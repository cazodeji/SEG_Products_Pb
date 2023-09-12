class BaseError extends Error {
  public statusCode;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(404, message);
  }
}

export class DuplicateEntryError extends BaseError {
  constructor(message: string) {
    super(403, message);
  }
}

export class MismatchError extends BaseError {
  constructor(message: string) {
    super(401, message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(403, message);
  }
}

export class ServerError extends BaseError {
  constructor(message: string) {
    super(500, message);
  }
}
