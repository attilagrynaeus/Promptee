const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');

export function createInMemoryDb() {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.registerLanguage('plpgsql', () => {}); // plpgsql

  db.public.none(`
    CREATE TABLE prompts (
      id uuid PRIMARY KEY,
      user_id uuid NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      description text,
      is_public boolean DEFAULT false,
      inserted_at timestamp DEFAULT NOW(),
      category_id uuid,
      favorit boolean DEFAULT false,
      next_prompt_id uuid,
      color text,
      sort_order int UNIQUE NOT NULL
    );
  `);

  const favoriteFnSql = fs.readFileSync(path.join(__dirname, 'favorite_fn.sql'), 'utf8');
  db.public.none(favoriteFnSql);

  return db;
}
