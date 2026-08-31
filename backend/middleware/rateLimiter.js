import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP address. Please try again after 1 minute.'
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'API rate limit exceeded (100 requests per minute). Please slow down your requests.'
  }
});

export const qrScanRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Security QR scan rate limit exceeded. Please wait a moment before scanning again.'
  }
});
