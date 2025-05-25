import { newDb } from 'pg-mem';
import fs from 'fs';

export function createInMemoryDb() {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  // UUID gen
  db.public.none(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  db.public.none(`
    CREATE TABLE prompts (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

  const favoriteFnSql = fs.readFileSync('./favorite_fn.sql', 'utf8');
  db.public.none(favoriteFnSql);

  return db;
}