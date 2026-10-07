export const successResponse = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

export const createdResponse = (res, data = null, message = 'Created successfully.') =>
  res.status(201).json({
    success: true,
    message,
    data,
  });

export const listResponse = (res, data = [], pagination = null, message = 'Success') => {
  const body = {
    success: true,
    message,
    data,
  };
  if (pagination) body.pagination = pagination;
  return res.status(200).json(body);
};

export const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
});

export const parsePagination = (query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
};

export const apiResponse = (res, data = null, statusCode = 200) =>
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 400,
    data,
  });
