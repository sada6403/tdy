const mongoose = require('mongoose');
const User = require('./src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
  const users = await User.find({ role: 'ADMIN' });
  console.log('Found', users.length, 'admin users.');
  users.forEach(u => {
    console.log(`- Name: ${u.name}, Email: ${u.email}, UserId: ${u.userId}`);
  });
  process.exit(0);
}
main();
