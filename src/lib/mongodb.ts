import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Define global scope type
declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

// Initialize connection cache
const globalConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
};

if (!global.mongooseConnection) {
  global.mongooseConnection = globalConnection;
}

async function dbConnect() {
  if (globalConnection.conn) {
    return globalConnection.conn;
  }

  if (!globalConnection.promise) {
    globalConnection.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose.connection;
    });
  }

  globalConnection.conn = await globalConnection.promise;
  return globalConnection.conn;
}

export default dbConnect; 