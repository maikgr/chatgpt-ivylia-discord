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
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export const isInWhitelist = async (userId) => {
  return whitelistDoc.exists({ userId });
}

export const addToWhitelist = async (userId) => {
  // Make sure user is not already in whitelist
  if (await isInWhitelist(userId)) {
    return;
  }
  const newWhitelist = new whitelistDoc({ userId });
  await newWhitelist.save();
}