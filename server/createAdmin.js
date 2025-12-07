// Script to create an admin user directly
// Usage: node createAdmin.js <email> <password> [firstName] [lastName]

import db from './db.js';
import { hashPassword } from './authService.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const email = process.argv[2];
const password = process.argv[3];
const firstName = process.argv[4] || null;
const lastName = process.argv[5] || null;

if (!email || !password) {
  console.error('Usage: node createAdmin.js <email> <password> [firstName] [lastName]');
  console.error('Example: node createAdmin.js admin@gmail.com password123 "Admin" "User"');
  process.exit(1);
}

try {
  // Check if user already exists
  const existingUser = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  
  if (existingUser) {
    console.log(`User with email ${email} already exists. Making them admin...`);
    db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('admin', existingUser.id);
    console.log(`✓ User ${email} (ID: ${existingUser.id}) has been set as admin.`);
    process.exit(0);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new admin user
  const result = db.prepare(`
    INSERT INTO users (email, password, firstName, lastName, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(email, hashedPassword, firstName, lastName);

  console.log(`✓ Admin user created successfully!`);
  console.log(`  Email: ${email}`);
  console.log(`  User ID: ${result.lastInsertRowid}`);
  console.log(`  Role: admin`);
  console.log(`\nYou can now log in with this account.`);
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

