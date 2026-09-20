/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '../.env.local');
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (match) {
    dbUrl = match.replace('DATABASE_URL=', '').trim();
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

async function runSeed() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    const seedFile = path.resolve(__dirname, '../supabase/seed.sql');
    if (!fs.existsSync(seedFile)) {
      console.error('seed.sql not found.');
      process.exit(1);
    }

    console.log('Applying seed data from supabase/seed.sql...');
    const sql = fs.readFileSync(seedFile, 'utf8');
    await client.query(sql);
    console.log('✓ Seed data applied successfully.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
