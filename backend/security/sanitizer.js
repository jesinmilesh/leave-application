export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export function containsSqlInjection(str) {
  if (typeof str !== 'string') return false;
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b\s+['"]?1['"]?\s*=\s*['"]?1)/i,
    /(\bAND\b\s+['"]?1['"]?\s*=\s*['"]?1)/i
  ];
  return sqlPatterns.some(pattern => pattern.test(str));
}
