CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example CRUD operations:
-- Create: INSERT INTO users (email, password_hash) VALUES ('alice@example.com', 'hash') RETURNING *;
-- Read: SELECT id, email, password_hash, created_at FROM users WHERE id = 1;
-- Update: UPDATE users SET email = 'new@example.com' WHERE id = 1;
-- Delete: DELETE FROM users WHERE id = 1;
