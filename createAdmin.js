const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authModel = require('./models/authModel');

const MONGODB_URI = process.env.DB_PRODUCTION_URL || "mongodb+srv://pancham047:vVs7jQEifTMefzyc@cluster0.o5koy.mongodb.net/";

async function createAdminUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Connected to MongoDB successfully!");

    const email = "jagriti@admin121";
    const plainPassword = "Radhe@121";
    const name = "jagriti mishra";
    const role = "admin";
    const category = "admin";

    const existingUser = await authModel.findOne({ email });
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.category = category;
      existingUser.status = "active";
      await existingUser.save();
      console.log("Existing admin user updated successfully.");
    } else {
      const newAdmin = await authModel.create({
        name,
        email,
        password: hashedPassword,
        role,
        category,
        status: "active",
        image: ""
      });
      console.log("New admin user created successfully! ID:", newAdmin._id);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createAdminUser();
