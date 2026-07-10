require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  const hash = await bcrypt.hash('Admin@123', 10);
  await db.collection('admins').updateOne(
    { username: 'admin' },
    { $set: { passwordHash: hash } },
    { upsert: true }
  );
  console.log('Main admin restored');

  const hash2 = await bcrypt.hash('CMS@789', 10);
  await db.collection('cmsadminusers').updateOne(
    { username: 'cmsadmin' },
    { $set: { passwordHash: hash2 } },
    { upsert: true }
  );
  console.log('CMS admin restored');

  await client.close();
}
seed().catch(e => console.error('Error:', e.message));
