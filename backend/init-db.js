const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bulkflyergenerator',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  ssl: false,
});

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing Database for Bulk Flyer Generator');
    console.log('================================================\n');

    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create refresh_tokens table
    console.log('🔑 Creating refresh_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create shows table
    console.log('🎭 Creating shows table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS shows (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date VARCHAR(50) NOT NULL,
        venue_name VARCHAR(255) NOT NULL,
        venue_address VARCHAR(500),
        city_state VARCHAR(100),
        show_time VARCHAR(50),
        event_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    console.log('⚡ Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_shows_user_id ON shows(user_id);
    `);

    console.log('\n🎉 Database initialized successfully!');
    console.log('=====================================');
    console.log('✅ All tables created');
    console.log('✅ Indexes created');
    console.log('\n💡 You can now run: node create-admin.js');

    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL is running and the database exists:');
      console.log('   createdb bulkflyergenerator');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist. Create it first:');
      console.log('   createdb bulkflyergenerator');
    }
    
    process.exit(1);
  }
}

// Run the script
initializeDatabase();
