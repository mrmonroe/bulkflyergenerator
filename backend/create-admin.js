const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bulkflyergenerator',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  ssl: false,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    console.log('🔧 Creating Admin User for Bulk Flyer Generator');
    console.log('===============================================\n');

    // Get admin details from user
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter first name (optional): ') || 'Admin';
    const lastName = await question('Enter last name (optional): ') || 'User';

    console.log('\n⏳ Connecting to database...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists');
      client.release();
      rl.close();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    console.log('👤 Creating admin user...');
    const result = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, created_at',
      [email, password_hash, firstName, lastName, true]
    );

    const adminUser = result.rows[0];
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log(`ID: ${adminUser.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.first_name} ${adminUser.last_name}`);
    console.log(`Created: ${adminUser.created_at}`);
    console.log('\n✅ You can now login with these credentials');

    client.release();
    rl.close();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL is running and the database exists:');
      console.log('   createdb bulkflyergenerator');
    } else if (error.code === '42P01') {
      console.log('\n💡 Make sure the database tables are created. Run the backend server once to initialize the database.');
    }
    
    rl.close();
    process.exit(1);
  }
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Run the script
createAdminUser();
