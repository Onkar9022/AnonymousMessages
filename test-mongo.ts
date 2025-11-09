// test-mongo.ts
import "dotenv/config";
import mongoose from "mongoose";

async function main() {
  const url = process.env.MONGODB_URL;

  if (!url) {
    console.error("MONGODB_URL is not set. Add it inside .env");
    process.exit(2);
  }

  // Hide credentials when printing
  const safeUrl = url.replace(
    /(mongodb\+srv:\/\/)[^@]+@/,
    "$1<credentials>@"
  );

  console.log("Testing MongoDB connection:", safeUrl);

  try {
    await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB successfully");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: unknown) {
    console.error("❌ Failed to connect to MongoDB");
    if (err instanceof Error) console.error(err.message);
    else console.error(err);
    process.exit(1);
  }
}

main();
