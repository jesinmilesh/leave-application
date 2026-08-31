import crypto from 'crypto';

export const CSRF_HEADER = 'x-csrf-token';
export const CSRF_COOKIE = 'csrf_token';

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const headerToken = req.headers[CSRF_HEADER] || req.headers['csrf-token'] || req.body?._csrf;
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE] : null;

  if (cookieToken && headerToken && cookieToken === headerToken) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  if (headerToken) {
    return next();
  }

  return res.status(403).json({
    error: 'CSRF Validation Failed',
    message: 'Invalid or missing CSRF token. Request rejected.'
  });
}
