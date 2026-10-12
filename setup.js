#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Interview Practice System...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  execSync('cd server && npm install', { stdio: 'inherit' });
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Copy environment file
console.log('⚙️ Setting up environment...');
const envPath = path.join('server', '.env');
const envExamplePath = path.join('server', '.env.example');

if (!fs.existsSync(envPath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Environment file created at server/.env');
    console.log('⚠️  Please add your Gemini API key to server/.env');
  } catch (error) {
    console.error('❌ Failed to create environment file:', error.message);
  }
} else {
  console.log('✅ Environment file already exists');
}

console.log('\n🎉 Setup complete!\n');

console.log('Next steps:');
console.log('1. Add your Gemini API key to server/.env');
console.log('2. Start MongoDB: mongod --dbpath ./data');
console.log('3. Seed sample data: npm run seed');
console.log('4. Start the application: npm run dev');
console.log('\nThe app will be available at http://localhost:3000');

console.log('\nTo get a Gemini API key:');
console.log('Visit: https://aistudio.google.com/');
console.log('Sign in and click "Get API Key"');