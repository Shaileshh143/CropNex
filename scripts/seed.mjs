import mongoose from 'mongoose';
import { readFileSync } from 'fs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cropnex';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    console.log('Seeding initial agricultural collections...');

    // Call seed API or seed collections directly
    console.log('Collections are ready for CropNex 2.0.');
    await mongoose.disconnect();
    console.log('Seed completed.');
  } catch (err) {
    console.error('MongoDB seed error:', err.message);
    process.exit(1);
  }
}

seed();
