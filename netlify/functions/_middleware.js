// Netlify middleware validating JWT for protected routes.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'TODO-change-me';

function getTokenFromHeaders(headers = {}) {
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookie = headers.cookie || headers.Cookie;
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

exports.handler = async (event, context) => {
  const { path } = event;
  if (path.endsWith('/login') || path.endsWith('/register')) return;
  try {
    const token = getTokenFromHeaders(event.headers);
    const user = jwt.verify(token, JWT_SECRET);
    context.user = user; // Expose decoded user to downstream functions
  } catch (err) {
    return { statusCode: 401, body: 'Unauthorized' };
  }
};
