import { verifyAccessToken } from '../security/jwt.js';

export function authenticateToken(req, res, next) {
  let token = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token required. Please log in.'
    });
  }

  const user = verifyAccessToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token.'
    });
  }

  req.user = user;
  next();
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = verifyAccessToken(token);
    if (user) req.user = user;
  }
  next();
}
