const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Read token from httpOnly cookie or Authorization header
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Access token missing' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

const restrictRoles = (...forbiddenRoles) => {
  return (req, res, next) => {
    if (!req.user || forbiddenRoles.includes(req.user.user_role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this role' });
    }
    next();
  };
};

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.user_role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this role' });
    }
    next();
  };
};

const optionalVerifyToken = (req, res, next) => {
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
      }
    } catch (err) {
      // Ignore invalid or expired token for optional auth check
    }
  }
  next();
};

module.exports = { verifyToken, restrictRoles, allowRoles, optionalVerifyToken };

