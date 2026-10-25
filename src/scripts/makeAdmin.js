const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const mongoose = require("mongoose");
const { connectDB } = require("../db");
const User = require("../models/User");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run make-admin -- user@example.com");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  if (!user) {
    console.error(`User not found: ${email}`);
  } else {
    console.log(`${user.email} is now admin`);
  }

  await mongoose.disconnect();
}

main();
