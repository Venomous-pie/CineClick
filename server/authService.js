import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const registerUser = async (email, password, firstName, lastName, phone) => {
  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const result = db.prepare(`
    INSERT INTO users (email, password, firstName, lastName, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run(email, hashedPassword, firstName || null, lastName || null, phone || null);

  const userId = result.lastInsertRowid;
  const token = generateToken(userId);

  // Get user data (without password)
  const user = db.prepare('SELECT id, email, firstName, lastName, phone, role, emailNotifications, smsNotifications, createdAt FROM users WHERE id = ?').get(userId);

  return { user, token };
};

export const loginUser = async (email, password) => {
  // Find user
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id);

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getUserById = (userId) => {
  const user = db.prepare('SELECT id, email, firstName, lastName, phone, role, emailNotifications, smsNotifications, createdAt, updatedAt FROM users WHERE id = ?').get(userId);
  return user || null;
};

export const updateUser = (userId, updates) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'emailNotifications', 'smsNotifications'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  fields.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(userId);

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  return getUserById(userId);
};

export const blacklistToken = (token, expiresAt) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    return false;
  }

  db.prepare(`
    INSERT INTO sessions (userId, token, expiresAt)
    VALUES (?, ?, ?)
  `).run(decoded.userId, token, expiresAt);

  return true;
};

export const isTokenBlacklisted = (token) => {
  const session = db.prepare('SELECT id FROM sessions WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP').get(token);
  return !!session;
};

