import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to Database");
    return;
  }

  try {
    const mongoUrl = process.env.MONGODB_URL || "";

    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not set");
    }

    const db = await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000, // ✅ FIX
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("✅ DB Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection failed");
    throw err;
  }
}

export default dbConnect;
