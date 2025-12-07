import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'auth.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    emailNotifications INTEGER DEFAULT 1,
    smsNotifications INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add role column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch (e) {
  // Column already exists, ignore
}

// Create sessions table for JWT token blacklisting (optional, for logout)
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    movieId TEXT NOT NULL,
    showtimeId TEXT NOT NULL,
    roomId TEXT NOT NULL,
    seats TEXT NOT NULL,
    totalPrice REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paymentMethod TEXT,
    bookingCode TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create pricing_config table
db.exec(`
  CREATE TABLE IF NOT EXISTS pricing_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    configKey TEXT UNIQUE NOT NULL,
    configValue REAL NOT NULL,
    description TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize default pricing if not exists
const defaultPricing = [
  { key: 'base_price', value: 250, desc: 'Base ticket price in PHP' },
  { key: 'room_basic_multiplier', value: 1.0, desc: 'Basic room price multiplier' },
  { key: 'room_3d_multiplier', value: 1.3, desc: '3D room price multiplier' },
  { key: 'room_premium_multiplier', value: 1.8, desc: 'Premium room price multiplier' },
  { key: 'room_vip_multiplier', value: 2.5, desc: 'VIP room price multiplier' },
];

defaultPricing.forEach(({ key, value, desc }) => {
  const existing = db.prepare('SELECT id FROM pricing_config WHERE configKey = ?').get(key);
  if (!existing) {
    db.prepare(`
      INSERT INTO pricing_config (configKey, configValue, description)
      VALUES (?, ?, ?)
    `).run(key, value, desc);
  }
});

export default db;

