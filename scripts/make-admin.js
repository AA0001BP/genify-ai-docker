// One-time script to promote a user to admin
// Usage: node scripts/make-admin.js user@email.com
// Or: node scripts/make-admin.js --list (to list all users)

require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      console.error('Make sure you have a .env file with MONGODB_URI defined');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Define a basic User schema for this script
const UserSchema = new Schema({
  name: String,
  email: String,
  isAdmin: Boolean
});

async function listUsers() {
  await connectDB();
  
  // Get the User model
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  try {
    // Find all users
    const users = await User.find({}, 'name email isAdmin');
    
    if (users.length === 0) {
      console.log('No users found in the database');
      process.exit(0);
    }
    
    console.log('\nUsers in the database:');
    console.log('====================');
    users.forEach(user => {
      console.log(`Name: ${user.name || 'N/A'}`);
      console.log(`Email: ${user.email}`);
      console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      console.log('--------------------');
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

async function makeAdmin() {
  await connectDB();
  
  // Get email from command line arguments
  const email = process.argv[2];
  
  if (email === '--list') {
    return listUsers();
  }
  
  if (!email) {
    console.error('Please provide an email address');
    console.error('Usage: node scripts/make-admin.js user@email.com');
    console.error('       node scripts/make-admin.js --list (to list all users)');
    process.exit(1);
  }
  
  // Get the User model
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  try {
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      console.log('\nTip: Run "node scripts/make-admin.js --list" to see all available users');
      process.exit(1);
    }
    
    if (user.isAdmin) {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }
    
    // Update the user to be an admin
    user.isAdmin = true;
    await user.save();
    
    console.log(`Success! User ${email} has been made an admin`);
    console.log('\nIMPORTANT: For the changes to take effect:');
    console.log('1. The user must log out of their current session');
    console.log('2. The user must log back in to receive a new session token with admin privileges');
    console.log('\nThe user can now access the admin panel at: /admin/affiliate');
  } catch (error) {
    console.error('Error making user an admin:', error);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
makeAdmin(); 