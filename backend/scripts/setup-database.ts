#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { checkDatabaseHealth } from '../src/lib/database';

async function setupDatabase() {
  console.log('🔧 Setting up database...');

  try {
    // Check if database is accessible
    console.log('📡 Checking database connection...');
    const isHealthy = await checkDatabaseHealth();
    
    if (!isHealthy) {
      console.error('❌ Database is not accessible. Please ensure your database server is running.');
      console.log('💡 Check your DATABASE_URL in .env file');
      process.exit(1);
    }

    console.log('✅ Database connection successful');

    // Apply migrations
    console.log('🔄 Applying database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run "npm run db:seed" to populate with test data');
    console.log('2. Run "npm run dev" to start the development server');
    console.log('3. Visit http://localhost:3001/health to verify everything is working');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };