const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplciateFieldsDB = (err) => {
  let value = err.errmsg.match(/([""'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use anthoer value!`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };

  if (error.name === 'CastError') error = handleCastErrorDB(err);
  if (error.code === 1100) error = handleDuplciateFieldsDB(err);

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV == 'production') {
    sendErrorProd(error, res);
  }
};
