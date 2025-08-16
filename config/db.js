import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log(" Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("🚀 Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/Quick`, opts)
      .then((mongoose) => {
        console.log(" MongoDB connected successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error(" MongoDB connection error:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error(" Error while awaiting MongoDB connection:", err.message);
    throw err;
  }
}

export default connectDB;
