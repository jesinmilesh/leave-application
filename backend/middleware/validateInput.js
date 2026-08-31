import { sanitizeInput, containsSqlInjection } from '../security/sanitizer.js';

export function sanitizeRequestBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        if (containsSqlInjection(req.body[key])) {
          return res.status(400).json({
            error: 'Security Error',
            message: `Malicious pattern detected in field '${key}'. Request rejected.`
          });
        }
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }

  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    }
  }

  next();
}

export function validateLeaveSubmission(req, res, next) {
  const { subject, reason, fromDate, toDate, parentPhone } = req.body;

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Subject line is required and must be at least 3 characters.'
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Reason for leave is required and must be at least 5 characters long.'
    });
  }

  if (reason.length > 1000) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Reason exceeds maximum length of 1000 characters.'
    });
  }

  if (!fromDate || !toDate) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'From Date and To Date are required.'
    });
  }

  if (parentPhone && !/^[0-9+\s\-()]{8,18}$/.test(parentPhone)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid parent phone number format.'
    });
  }

  next();
}
