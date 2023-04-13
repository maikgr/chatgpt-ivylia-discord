import { ChatGPTAPI } from 'chatgpt'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { Client, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js'
import { differenceInMinutes } from 'date-fns'
import { connectToDb, saveChat, getLatest, isInWhitelist, addToWhitelist } from './dbHandler.js'

dotenv.config();
connectToDb();
const clientsMap = new Map();

const getChannelClient = async (channelId, reset = false) => {
  if (!reset && clientsMap.has(channelId)) return clientsMap.get(channelId)

  const client = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: fetch,
  })

  const res = await client.sendMessage(process.env.INITIAL_PROMPT)
  console.log('Initialized channel', channelId, 'response text', res.text)

  await saveChat(channelId, {
    authorId: process.env.OWNER_ID,
    authorUsername: process.env.OWNER_ID,
    messageId: null,
    content: process.env.INITIAL_PROMPT,
    chatGptId: res.id,
  })

  clientsMap.set(channelId, client)

  return client
}

async function sendChatGpt(api, content, parentId) {
  const res = await api.sendMessage(content, {
    parentMessageId: parentId,
  })

  return {
    chatGptId: res.id,
    content: res.text,
  }
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (client) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  const whitelistCommand = new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Whitelist a user (owner only)')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('User ID')
        .setRequired(true)
    );

  const data = await client.application?.commands.create(whitelistCommand);
  console.log(`Created command ${data?.name}`)
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.user.id !== process.env.OWNER_ID) {
    await interaction.reply('You are not authorized to use this command')
    return
  }

  if (interaction.commandName === 'whitelist') {
    const userId = interaction.options.getString('user_id')
    await addToWhitelist(userId);
    await interaction.reply({
      content: `Whitelisted user ${userId}`,
      ephemeral: true,
    })
  }
})

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !(await isInWhitelist(message.author.id)) || !message.mentions.has(client.user)) {
    return
  }

  const messageContent = message.content
    .replace(`<@!${client.user.id}>`, '')
    .replace(`<@${client.user.id}>`, '')
    .trim()

  message.channel.sendTyping()
  let api = await getChannelClient(message.channelId)
  const latest = await getLatest(message.channelId)
  if (latest && differenceInMinutes(new Date(), latest.timestamp) > process.env.SESSION_EXPIRY_MINUTES) {
    api = await getChannelClient(message.channelId, true)
  }

  const chatParentId = latest ? latest.chatGptId : null
  const chatGptResponse = await sendChatGpt(api, messageContent, chatParentId)
  await saveChat(message.channelId, {
    authorId: message.author.id,
    authorUsername: message.author.username,
    messageId: message.id,
    content: messageContent,
    chatGptId: chatGptResponse.chatGptId,
  })

  message.reply({
    content: chatGptResponse.content,
    allowedMentions: {
      repliedUser: false,
    },
  })
});

client
  .on("debug", console.log)
  .on("warn", console.log)

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
