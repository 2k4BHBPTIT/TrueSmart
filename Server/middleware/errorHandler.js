// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error object
  const error = {
    status: err.status || 500,
    message: err.message || 'Lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Dữ liệu không hợp lệ';
    error.details = Object.values(err.errors).map(e => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.status = 400;
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} này đã được sử dụng`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Token không hợp lệ';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token đã hết hạn';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    error.status = 400;
    if (err.code === 'FILE_TOO_LARGE') {
      error.message = 'File quá lớn';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.message = 'Quá nhiều file';
    } else {
      error.message = 'Lỗi khi tải file';
    }
  }

  // Cast error
  if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'ID không hợp lệ';
  }

  res.status(error.status).json({
    success: false,
    msg: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  });
};

module.exports = errorHandler;
