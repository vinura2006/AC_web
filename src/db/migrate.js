const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  if (!pool) {
    console.error('❌ Cannot run migrations: DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migrations...');

    // 1. Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read all .sql files in migrations dir
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 3. Get applied migrations
    const res = await client.query('SELECT version FROM schema_migrations');
    const applied = new Set(res.rows.map((r) => r.version));

    let count = 0;
    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`⏳ Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Applied migration: ${file}`);
          count++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed in ${file}:`, err);
          throw err;
        }
      }
    }

    if (count === 0) {
      console.log('✨ Database is already up to date. No new migrations.');
    } else {
      console.log(`🎉 Successfully applied ${count} migration(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}

module.exports = { migrate };
