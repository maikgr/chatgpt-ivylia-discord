import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js'
import { connectToDb, isInWhitelist, addToWhitelist } from './dbHandler.js'
import { getAPI } from './chatApi.js'

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

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !(await isInWhitelist(message.author.id)) || !message.mentions.has(client.user)) {
    return
  }

  const messageContent = message.content
    .replace(`<@!${client.user.id}>`, '')
    .replace(`<@${client.user.id}>`, '')
    .trim()

  message.channel.sendTyping()
  let api = await getAPI(message.channelId)
  const username = process.env.OWNER_ID === message.author.id ? process.env.OWNER_USERNAME : message.member.displayName;
  const chatGptResponse = await api.sendMessage(messageContent, {
    name: sanitizeUsername(username) || 'Anonymous',
  });

  message.reply({
    content: chatGptResponse.text,
    allowedMentions: {
      repliedUser: false,
    },
  })
});

client
  .on("warn", console.log)

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
