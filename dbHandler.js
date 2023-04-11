import * as dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config();

const { Schema } = mongoose;

const ChatSchema = new Schema({
  authorId: String,
  authorUsername: String,
  messageId: String,
  content: String,
  chatGptId: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WhitelistSchema = new Schema({
  userId: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


export const connectToDb = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export const saveChat = async (channelId, chat) => {
  const channelDoc = new mongoose.model(channelId, ChatSchema);
  const newChat = new channelDoc(chat);
  await newChat.save();
}

export const getLatest = async (channelId) => {
  const channelDoc = new mongoose.model(channelId, ChatSchema);
  const latest = await channelDoc.findOne().sort({ timestamp: -1 });
  return latest;
}

export const isInWhitelist = async (userId) => {
  const whitelistDoc = new mongoose.model('whitelist', WhitelistSchema, 'whitelist');
  return whitelistDoc.exists({ userId });
}