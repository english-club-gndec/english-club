const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { ALL_PERMISSIONS, SYSTEM_ROLES } = require('../utils/permissions');

// In-memory cache for custom role permissions (5-minute TTL)
const rolePermissionsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const fetchRolePermissions = async (roleName) => {
  if (!roleName) return [];
  const normalized = String(roleName).toUpperCase().trim();

  // Check system roles first
  if (SYSTEM_ROLES[normalized]) {
    return SYSTEM_ROLES[normalized].permissions;
  }

  // Check cache
  const cached = rolePermissionsCache.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.permissions;
  }

  try {
    const { data, error } = await supabase
      .from('roles')
      .select('permissions')
      .eq('role_name', normalized)
      .single();

    if (!error && data?.permissions) {
      const permissions = Array.isArray(data.permissions) ? data.permissions : [];
      rolePermissionsCache.set(normalized, { permissions, timestamp: Date.now() });
      return permissions;
    }
  } catch (err) {
    console.error(`Failed to fetch permissions for role ${normalized}:`, err.message);
  }

  return [];
};

const verifyToken = (req, res, next) => {
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
    const userRole = req.user?.user_role?.toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!req.user || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this role' });
    }
    next();
  };
};

// Granular RBAC Permission Middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No active session' });
    }

    const userRole = String(req.user.user_role || '').toUpperCase().trim();

    // MASTER & ADMIN have super-admin privileges across all routes
    if (userRole === 'MASTER' || userRole === 'ADMIN') {
      return next();
    }

    // MANAGER has full access across all regular panel permissions
    if (userRole === 'MANAGER') {
      return next();
    }

    // Check custom or specific role permissions
    try {
      const permissions = await fetchRolePermissions(userRole);
      if (permissions.includes(permission)) {
        return next();
      }
    } catch (err) {
      console.error('Error verifying permission:', err);
    }

    return res.status(403).json({
      error: `Forbidden: Missing required permission '${permission}'`,
      requiredPermission: permission,
    });
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

module.exports = {
  verifyToken,
  restrictRoles,
  allowRoles,
  requirePermission,
  optionalVerifyToken,
  fetchRolePermissions,
};
