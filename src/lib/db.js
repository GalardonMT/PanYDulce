import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../sqlite.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_featured INTEGER DEFAULT 0,
    category_id INTEGER,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
`);

// ── Auto-migration: add missing columns ────────────────────────
function ensureColumn(table, column, type, defaultValue) {
  const columns = db.pragma(`table_info(${table})`);
  const exists = columns.some(col => col.name === column);
  if (!exists) {
    const def = defaultValue !== undefined ? ` DEFAULT ${defaultValue}` : '';
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}${def}`);
    console.log(`[DB] Added column "${column}" to table "${table}"`);
  }
}

ensureColumn('menus', 'is_featured', 'INTEGER', 0);
ensureColumn('menus', 'category_id', 'INTEGER', 'NULL');

export default db;
