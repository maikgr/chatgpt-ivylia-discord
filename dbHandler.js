import * as dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config();

const { Schema } = mongoose;

const WhitelistSchema = new Schema({
  userId: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const whitelistDoc = new mongoose.model('whitelist', WhitelistSchema, 'whitelist');

export const connectToDb = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('MONGO_URI is undefined, disabling whitelist feature...')
    return
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export const isInWhitelist = async (userId) => {
  if (!process.env.MONGO_URI) {
    return false;
  }
  return whitelistDoc.exists({ userId });
}

export const addToWhitelist = async (userId) => {
  if (!process.env.MONGO_URI) {
    return;
  }
  // Make sure user is not already in whitelist
  if (await isInWhitelist(userId)) {
    return;
  }
  const newWhitelist = new whitelistDoc({ userId });
  await newWhitelist.save();
}

export const isDatabaseInitialized = () => {
  return !!process.env.MONGO_URI;
}