export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message = 'Bad request.', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden.', errors = null) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict.', errors = null) {
    return new ApiError(409, message, errors);
  }
}

export default ApiError;
