// Netlify middleware validating JWT and trial/subscription status.
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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

  let user;
  try {
    const token = getTokenFromHeaders(event.headers);
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { rows } = await pool.query(
      'SELECT trial_started_at, subscription_active FROM users WHERE id = $1',
      [user.id]
    );
    const record = rows[0];
    const trialValid =
      record &&
      record.trial_started_at &&
      Date.now() - new Date(record.trial_started_at).getTime() < 7 * 24 * 60 * 60 * 1000;
    if (!record || (!record.subscription_active && !trialValid)) {
      return { statusCode: 402, body: 'Subscription required' };
    }
    context.user = user; // Expose decoded user to downstream functions
  } catch (err) {
    return { statusCode: 500, body: 'Server error' };
  }
};
