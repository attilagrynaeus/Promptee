// Netlify serverless function handling user auth.
// TODO: Provide DATABASE_URL and JWT_SECRET as environment variables.
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || 'TODO-change-me';

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);
}

async function registerUser(email, password) {
  await ensureUsersTable();
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hashed]
  );
  return result.rows[0];
}

async function loginUser(email, password) {
  await ensureUsersTable();
  const { rows } = await pool.query(
    'SELECT id, email, password FROM users WHERE email = $1',
    [email]
  );
  if (!rows.length) throw new Error('Invalid credentials');
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function verifyToken(header) {
  const [, token] = (header || '').split(' ');
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, JWT_SECRET);
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { path } = event;
    const { email, password } = JSON.parse(event.body || '{}');

    if (path.endsWith('/register')) {
      if (!email || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }
      const user = await registerUser(email, password);
      return { statusCode: 201, body: JSON.stringify({ id: user.id, email: user.email }) };
    }

    if (path.endsWith('/login')) {
      if (!email || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }
      const token = await loginUser(email, password);
      return { statusCode: 200, body: JSON.stringify({ token }) };
    }

    const user = verifyToken(event.headers.authorization);
    return { statusCode: 200, body: JSON.stringify({ user }) };
  } catch (err) {
    const status = err.message.includes('Invalid') || err.message.includes('Missing') ? 401 : 500;
    return { statusCode: status, body: JSON.stringify({ error: err.message }) };
  }
};

