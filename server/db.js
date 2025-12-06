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
    emailNotifications INTEGER DEFAULT 1,
    smsNotifications INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

export default db;

