import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js'
import { connectToDb, isInWhitelist, addToWhitelist } from './dbHandler.js'
import { getAPI } from './chatApi.js'
import { getRandomIvyliaResponse } from './fixedResponses.js'

dotenv.config();
connectToDb();

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
    await interaction.reply({
      content: 'Sorry, you are not authorized to use this command',
      ephemeral: true,
    })
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

const sanitizeUsername = (username) => {
  return username.replace(/[^a-zA-Z0-9]/g, '').replace(/\s/g, '').slice(0, 64);
}

const splitMarkdownString = (str) => {
  const maxLength = 2000;
  const lines = str.split('\n');
  let chunks = [];
  let currentChunk = '';
  let isInCodeBlock = false;

  for (let line of lines) {
    if (line.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
      if (!isInCodeBlock) {
        currentChunk += line + '\n';
        if (currentChunk.length > maxLength) {
          const chunkLines = currentChunk.split('\n');
          let chunkLinesLength = 0;
          let chunkLinesArray = [];
          for (let i = 0; i < chunkLines.length; i++) {
            chunkLinesLength += chunkLines[i].length + 1;
            chunkLinesArray.push(chunkLines[i]);
            if (chunkLinesLength > maxLength) {
              chunks.push('```' + chunkLinesArray.join('\n') + '```');
              chunkLinesArray = [];
              chunkLinesLength = 0;
            }
          }
          if (chunkLinesArray.length > 0) {
            chunks.push('```' + chunkLinesArray.join('\n') + '```');
          }
          currentChunk = '';
        }
      } else {
        chunks.push(currentChunk);
        currentChunk = line + '\n';
      }
    } else {
      if (isInCodeBlock) {
        currentChunk += line + '\n';
      } else {
        if (currentChunk.length + line.length + 1 > maxLength) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        currentChunk += line + '\n';
        while (currentChunk.length > maxLength) {
          const chunk = currentChunk.substring(0, maxLength);
          chunks.push(chunk);
          currentChunk = currentChunk.substring(maxLength);
        }
      }
    }
  }

  if (currentChunk !== '') {
    chunks.push(currentChunk);
  }

  const hasMarkdownSyntax = (chunk) => {
    return chunk.includes('```');
  };

  const properlyEncloseChunk = (chunk) => {
    if (hasMarkdownSyntax(chunk)) {
      return '```\n' + chunk + '```';
    } else {
      return chunk;
    }
  };

  return chunks.map(properlyEncloseChunk);
}

const splitRegularString = (str) => {
  const maxLength = 2000;
  if (str.length <= maxLength) {
    return [str];
  }
  const chunks = [];
  let chunkStart = 0;
  let lastNewlineIndex = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\n') {
      lastNewlineIndex = i;
    }
    if (i - chunkStart >= maxLength) {
      if (lastNewlineIndex !== -1 && lastNewlineIndex >= chunkStart) {
        chunks.push(str.slice(chunkStart, lastNewlineIndex));
        chunkStart = lastNewlineIndex + 1;
        lastNewlineIndex = -1;
      } else {
        chunks.push(str.slice(chunkStart, i));
        chunkStart = i;
        lastNewlineIndex = -1;
      }
    }
  }
  if (chunkStart < str.length) {
    chunks.push(str.slice(chunkStart));
  }
  return chunks;
}

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !(await isInWhitelist(message.author.id)) || !message.mentions.has(client.user)) {
    return
  }

  const messageContent = message.content
    .replace(`<@!${client.user.id}>`, '')
    .replace(`<@${client.user.id}>`, '')
    .trim()

  const currentMessage = await message.reply({
    content: getRandomIvyliaResponse(),
    allowedMentions: {
      repliedUser: false,
    }
  });
  message.channel.sendTyping();
  let api = await getAPI(message.channelId)
  const username = process.env.OWNER_ID === message.author.id ? process.env.OWNER_USERNAME : message.member.displayName;
  let responseText = '';
  try {
    const chatGptResponse = await api.sendMessage(messageContent, {
      name: sanitizeUsername(username) || 'Anonymous',
    });
    responseText = chatGptResponse.text;
  }
  catch (e) {
    if (e.error.message) {
      responseText = 'Sorry, unable to generate a response. Please try again later. Error: ```' + e.error.message + '```';
    }
    else {
      throw e;
    }
  }

  // Discord has a 2000 character limit for messages
  if (responseText.length > 2000) {
    let chunks = []
    if (responseText.includes('```')) {
      chunks = splitMarkdownString(responseText);
    }
    else {
      chunks = splitRegularString(responseText);
    }

    for (const chunk of chunks) {
      console.log(chunk);
      message.reply({
        content: chunk,
        allowedMentions: {
          repliedUser: false,
        },
      })
    }
  }
  else {
    currentMessage.edit({
      content: responseText,
      allowedMentions: {
        repliedUser: false,
      },
    })
  }
});

client
  .on("warn", console.log)

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
