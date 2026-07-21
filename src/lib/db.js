import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastAttemptFailed: false, failedTime: 0 };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  // If last attempt failed within the last 15 seconds, skip waiting to keep localhost super fast
  if (cached.lastAttemptFailed && Date.now() - cached.failedTime < 15000) {
    return null;
  }

  if (!cached.promise) {
    const uri = MONGODB_URI || "mongodb://127.0.0.1:27017/farm-to-table";
    const opts = {
      serverSelectionTimeoutMS: 1500,
      bufferCommands: false
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log("Connected to MongoDB successfully");
      cached.lastAttemptFailed = false;
      return m;
    }).catch((err) => {
      console.warn("MongoDB offline/unavailable (using instant fallback):", err.message);
      cached.lastAttemptFailed = true;
      cached.failedTime = Date.now();
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

