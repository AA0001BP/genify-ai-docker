// Script to check the content of a JWT token
// Usage: node scripts/check-token.js <token>

require('dotenv').config();
const { jwtVerify } = require('jose');

// Get token from command line
const token = process.argv[2];

if (!token) {
  console.error('Please provide a token');
  console.error('Usage: node scripts/check-token.js <token>');
  process.exit(1);
}

async function verifyToken() {
  try {
    // Verify and decode the token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_please_set_env_var'
    );
    
    const { payload } = await jwtVerify(token, secret);
    
    console.log('Token is valid and contains:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Specifically check for admin rights
    if (payload.isAdmin) {
      console.log('\n✅ Token contains admin privileges');
    } else {
      console.log('\n❌ Token does NOT contain admin privileges');
    }
    
    // Check expiration
    if (payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      
      console.log(`\nToken expires: ${expiryDate}`);
      
      if (expiryDate > now) {
        const timeLeft = (expiryDate - now) / 1000 / 60 / 60;
        console.log(`Token is valid for approximately ${timeLeft.toFixed(1)} more hours`);
      } else {
        console.log('Token has expired!');
      }
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    process.exit(1);
  }
}

verifyToken(); 