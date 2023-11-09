import { ChatGPTAPI } from 'chatgpt'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import { encode } from 'gpt-3-encoder'
dotenv.config();

// Define a new ChatGPT class that handles the original ChatGPT class
class IvyliaAPI {
  TOKEN_LIMIT = 3096;
  constructor(options) {
    this.options = options;
    this.tokenCounter = 0;
    this.lastMessageId = null;
    this.lastMessageText = null;
    this.chatGptClient = null;
  }

  async initializePrompt(options = {}) {
    console.log('Creating new ChatGPT instance...');
    const newChatGPT = new ChatGPTAPI(this.options);

    const intialRes = await newChatGPT.sendMessage(process.env.INITIAL_PROMPT, options)
    this.tokenCounter += encode(process.env.INITIAL_PROMPT).length;

    let lastMessage = intialRes;
    if (this.lastMessageId) {
      lastMessage = await newChatGPT.sendMessage(this.lastMessageText, {
        ...options,
        parentMessageId: intialRes.id,
      });
      this.tokenCounter += encode(this.lastMessageText).length;
    }

    this.lastMessageId = lastMessage.id;
    this.lastMessageText = this.lastMessageText || process.env.INITIAL_PROMPT;

    this.chatGptClient = newChatGPT;
  }

  // Override the sendMessage method to check the token counter before sending the request
  async sendMessage(prompt, options = {}) {
    if (this.tokenCounter >= this.TOKEN_LIMIT || !this.lastMessageId || !this.chatGptClient) {
      await this.initializePrompt();
    }
    const message = await this.chatGptClient.sendMessage(prompt, {
      ...options,
      parentMessageId: this.lastMessageId,
    });

    this.tokenCounter += encode(prompt).length;

    this.lastMessageId = message.id;
    this.lastMessageText = prompt;

    return message;
  }
}

const clientsMap = new Map();

export const getAPI = async (channelId) => {
  if (clientsMap.has(channelId)) return clientsMap.get(channelId)

  const client = new IvyliaAPI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: fetch,
    completionParams: {
      model: 'gpt-4-1106-preview',
    }
  })

  clientsMap.set(channelId, client)

  return client
}