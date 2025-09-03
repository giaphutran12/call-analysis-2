// Simple script to install required dependencies
const { execSync } = require('child_process');

console.log('Installing required dependencies...');

try {
  execSync('npm install axios @types/xlsx dotenv', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}
