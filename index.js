import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js'
import { connectToDb, isInWhitelist, addToWhitelist, isDatabaseInitialized } from './dbHandler.js'
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

  if (isDatabaseInitialized()) {
    const data = await client.application?.commands.create(whitelistCommand);
    console.log(`Created command ${data?.name}`);
  }
  else {
    console.log('Database not initialized, whitelist command is disabled...');
  }
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

  if (interaction.commandName === 'whitelist' && isDatabaseInitialized()) {
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

const raceResponse = {
  awaiting: "awaiting",
  responded: "responded"
}

const sendIvyliaGptResponse = async (message, messageContent) => {
  let api = await getAPI(message.channelId)
  const username = process.env.OWNER_ID === message.author.id ? process.env.OWNER_USERNAME : message.member.displayName;
  const chatGptResponse = await api.sendMessage(messageContent, {
    name: sanitizeUsername(username) || 'Anonymous',
  });
  let responseText = chatGptResponse.text;
  let messages = [responseText]

  // Discord has a 2000 character limit for messages
  if (responseText.length > 2000) {
    let chunks = []
    if (responseText.includes('```')) {
      chunks = splitMarkdownString(responseText);
    }
    else {
      chunks = splitRegularString(responseText);
    }
    messages = [];
    for (const chunk of chunks) {
      messages.push(chunk);
    }
  }
  return {
    status: raceResponse.responded,
    messages: messages,
  };
}

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !(await isInWhitelist(message.author.id)) || !message.mentions.has(client.user)) {
    return
  }

  const messageContent = message.content
    .replace(`<@!${client.user.id}>`, '')
    .replace(`<@${client.user.id}>`, '')
    .trim()

  const waitResponsePromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: raceResponse.awaiting,
        messages: [getRandomIvyliaResponse()],
      })
    }, process.env.WAIT_TIMER || 15000);
  });

  const resultResponsePromise = new Promise(async (resolve) => {
    const result = await sendIvyliaGptResponse(message, messageContent)
    resolve(result)
  });

  message.channel.sendTyping();

  let lastMessageResult = raceResponse.awaiting;
  Promise.race([resultResponsePromise, waitResponsePromise])
    .then(result => {
      if (result?.status === raceResponse.awaiting) {
        lastMessageResult = raceResponse.awaiting;
        message.reply({
          content: result.messages[0],
          allowedMentions: {
            repliedUser: false,
          },
        })
        message.channel.sendTyping();
        return resultResponsePromise
      }
      else if (result?.status === raceResponse.responded) {
        for (const contentMessage of result.messages) {
          message.reply({
            content: contentMessage,
            allowedMentions: {
              repliedUser: false,
            },
          })
        }
        lastMessageResult = raceResponse.responded;
      }
      return Promise.resolve()
    })
    .then(() => {
      if (lastMessageResult === raceResponse.awaiting) { // to differentiate between empty promise and responded promise
        return resultResponsePromise
      }
      return Promise.resolve()
    })
    .then((result) => {
      if (result?.status === raceResponse.responded) {
        for (const contentMessage of result.messages) {
          message.reply({
            content: contentMessage,
            allowedMentions: {
              repliedUser: false,
            },
          })
        }
        lastMessageResult = raceResponse.responded;
      }
    })
    .catch(e => {
      let errorText = 'Sorry, unable to generate a response. Please try again later.';
      if (e.error?.message) {
        errorText += '```' + e.error.message + '```';
      }

      message.reply({
        content: errorText,
        allowedMentions: {
          repliedUser: false,
        },
      })

      throw e;
    })
    .finally(() => {
      lastMessageResult = raceResponse.awaiting;
    })
});

client
  .on("warn", console.log)

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
