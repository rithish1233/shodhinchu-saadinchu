const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const hostOnly = (req, res, next) => {
  if (req.user?.role !== 'host') {
    return res.status(403).json({ error: 'Host access required.' });
  }
  next();
};

const teamOnly = (req, res, next) => {
  if (req.user?.role !== 'team') {
    return res.status(403).json({ error: 'Team access required.' });
  }
  next();
};

module.exports = { authMiddleware, hostOnly, teamOnly };
