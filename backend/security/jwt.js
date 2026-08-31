import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'pec-leave-portal-super-secret-production-key-2026';
export const REFRESH_SECRET = process.env.REFRESH_SECRET || 'pec-refresh-secret-production-key-2026';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    department: user.department,
    email: user.email
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    role: user.role
  };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}
