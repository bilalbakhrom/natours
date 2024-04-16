const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('./../utils/catchAsync');

// MARK: - HELPERS

const signJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const getUserByToken = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+password');

  return { user: user, jwtIssued: decoded.iat };
};

const getTokenFromHeader = (headers) => {
  let token;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  return token;
};

// MAKR: - API FUNCTIONS

const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: Date.now(),
  });

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);

  if (!correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signJWT(user.id);

  res.status(201).json({
    status: 'success',
    token: token,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });

  if (!email || !user) {
    return next(new AppError('No user found with specified email'), 403);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, ignore this email.`;

  await sendEmail({
    email: email,
    subject: 'Your password reset token valid for 10 min',
    message: message,
  });

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token has expired'), 403);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signJWT(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  const token = getTokenFromHeader(req.headers);
  const { user, jwtIssued } = await getUserByToken(token);

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401),
    );
  }

  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        404,
      ),
    );
  }

  if (user.changedPasswordAfter(jwtIssued)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

const updatePassword = catchAsync(async (req, res, next) => {
  const token = getTokenFromHeader(req.headers);
  const { user } = await getUserByToken(token);
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        404,
      ),
    );
  }
  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(
      new AppError('Please specifiy new password and old password'),
      403,
    );
  }
  if (password !== passwordConfirm) {
    return next(new AppError('Old passwords are not the same', 403));
  }
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  const newToken = signJWT(user.id);

  res.status(201).json({
    status: 'success',
    token: newToken,
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  restrictTo,
  updatePassword,
};
