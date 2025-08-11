const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} secret - JWT secret
 * @param {String} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - JWT secret
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Check if user has required role
 * @param {String} userRole - User's role
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Boolean} True if user has required role
 */
const hasRequiredRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY = {
  admin: 3,
  teacher: 2,
  student: 1
};

/**
 * Check if user has sufficient role level
 * @param {String} userRole - User's role
 * @param {String} requiredRole - Required minimum role
 * @returns {Boolean} True if user has sufficient role level
 */
const hasMinimumRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Generate password reset token
 * @returns {String} Reset token
 */
const generateResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Hash password reset token
 * @param {String} token - Reset token to hash
 * @returns {String} Hashed token
 */
const hashResetToken = (token) => {
  return require('crypto').createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  hasRequiredRole,
  hasMinimumRole,
  generateResetToken,
  hashResetToken,
  ROLE_HIERARCHY
};
