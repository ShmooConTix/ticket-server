import { customAlphabet } from "nanoid";
import { Database } from "bun:sqlite";

export const generateUniqueID = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789",
  8
);

export const generateUniqueIDlowercase = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz123456789",
  8
);

export const generateUniqueCookieID = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_",
  103
);

export function initalizeDatabase(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS riddles (
        riddle TEXT NOT NULL,
        answer TEXT NOT NULL,
        image_url TEXT,
        secret_key TEXT NOT NULL
    );
  `);


  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id TEXT NOT NULL,
        hold_id TEXT,
        sale_id TEXT,
        confirmation_id TEXT,
        ticket_count INTEGER,
        email TEXT,
        xc TEXT,
        cc TEXT,
        conf TEXT,
        completed_sale BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}