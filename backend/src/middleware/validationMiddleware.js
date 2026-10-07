export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      if (source === 'body') {
        req.body = result.data;
      } else {
        // Express defines req.query as a getter, so keep parsed values aside.
        req.validatedQuery = result.data;
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');

export default validate;
