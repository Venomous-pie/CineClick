// Script to make a user an admin
// Usage: node makeAdmin.js <user-email>
// 
// Note: If the user doesn't exist, use createAdmin.js instead:
// node createAdmin.js <email> <password> [firstName] [lastName]

import db from './db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const email = process.argv[2];

if (!email) {
  console.error('Usage: node makeAdmin.js <user-email>');
  console.error('\nIf the user doesn\'t exist, use createAdmin.js instead:');
  console.error('  node createAdmin.js <email> <password> [firstName] [lastName]');
  process.exit(1);
}

try {
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  
  if (!user) {
    console.error(`❌ User with email ${email} not found.`);
    console.error('\nTo create a new admin user, use:');
    console.error(`  node createAdmin.js ${email} <password> [firstName] [lastName]`);
    console.error('\nOr register the user first through the website, then run this script again.');
    process.exit(1);
  }

  db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('admin', user.id);
  
  console.log(`✓ User ${email} (ID: ${user.id}) has been set as admin.`);
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

