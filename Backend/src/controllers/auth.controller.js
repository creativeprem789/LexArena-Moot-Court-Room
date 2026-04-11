const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
  };

  // Enable secure cookies in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'none';
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .redirect(process.env.FRONTEND_URL + '/dashboard'); 
};

exports.googleAuthCallback = (req, res) => {
  // Passport provides the user object in req.user after successful authentication
  sendTokenResponse(req.user, 200, res);
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

exports.getCurrentUser = async (req, res) => {
  // req.user is set in auth.middleware.js
  res.status(200).json({
    success: true,
    data: req.user,
  });
};
