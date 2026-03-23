require("dotenv").config();

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder,
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN || null;
const PREFIX = process.env.PREFIX || "!";
const USER_AGENT = process.env.BOT_USER_AGENT || "discord-bot/1.0 (https://discord.com)";

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "bot-data.json");
const MARRIAGE_FILE = path.join(DATA_DIR, "marriage.json");
const ASSETS_DIR = path.join(__dirname, "assets");

const DEFAULT_DATA = {
  profiles: {},
};

const MEDIA_GIFS = {
  marry: [
    "attachment://marry_accepted.gif",
  ],
  blackjackWin: [
    "https://media.tenor.com/6k3N6d6V5M4AAAAC/anime-win.gif",
    "https://media.tenor.com/E8zqz0tX8wQAAAAC/anime-celebrate.gif",
  ],
  blackjackLose: [
    "https://media.tenor.com/0rQwM8G9m7QAAAAC/anime-sad.gif",
    "https://media.tenor.com/OWV2LjuSle0AAAAC/anime-cry.gif",
  ],
  blackjackPush: [
    "https://media.tenor.com/Ue95syEHCqgAAAAC/anime-shrug.gif",
  ],
  coinflipWin: [
    "https://media.tenor.com/ukdQ0P6M3mAAAAAC/anime-happy.gif",
  ],
  coinflipLose: [
    "https://media.tenor.com/BJkUQ6sD9gUAAAAC/anime-disappointed.gif",
  ],
};

const MARRIAGE_ASSETS = {
  proposal: {
    file: path.join(ASSETS_DIR, "marry_proposal.gif"),
    name: "marry_proposal.gif",
  },
  accepted: {
    file: path.join(ASSETS_DIR, "marry_accepted.gif"),
    name: "marry_accepted.gif",
  },
  rejected: {
    file: path.join(ASSETS_DIR, "marry_rejected.gif"),
    name: "marry_rejected.gif",
  },
};

const ROLEPLAY_COMMANDS = {
  hug: { api: "hug", verb: "hugs", needsTarget: true, color: 0xff8fab, statKey: "hugsSent" },
  kiss: { api: "kiss", verb: "kisses", needsTarget: true, color: 0xff69b4, statKey: "kissesSent" },
  cuddle: { api: "cuddle", verb: "cuddles", needsTarget: true, color: 0xf8b4d9, statKey: "cuddlesSent" },
  pat: { api: "pat", verb: "pats", needsTarget: true, color: 0xf6c453, statKey: "patsSent" },
  poke: { api: "poke", verb: "pokes", needsTarget: true, color: 0x8ec5fc, statKey: "pokesSent" },
  slap: { api: "slap", verb: "slaps", needsTarget: true, color: 0xff7f7f, statKey: "slapsSent" },
  bite: { api: "bite", verb: "bites", needsTarget: true, color: 0xff9a76, statKey: "bitesSent" },
  tickle: { api: "tickle", verb: "tickles", needsTarget: true, color: 0xc4b5fd, statKey: "ticklesSent" },
  bonk: { api: "bonk", verb: "bonks", needsTarget: true, color: 0xd4a373, statKey: "bonksSent" },
  highfive: { api: "highfive", verb: "high-fives", needsTarget: true, color: 0x7dd3fc, statKey: "highfivesSent" },
  handshake: { api: "handshake", verb: "shakes hands with", needsTarget: true, color: 0x93c5fd, statKey: "handshakesSent" },
  handhold: { api: "handhold", verb: "holds hands with", needsTarget: true, color: 0xf9a8d4, statKey: "handholdsSent" },
  feed: { api: "feed", verb: "feeds", needsTarget: true, color: 0xfcd34d, statKey: "feedsSent" },
  punch: { api: "punch", verb: "punches", needsTarget: true, color: 0xf87171, statKey: "punchesSent" },
  shoot: { api: "shoot", verb: "shoots", needsTarget: true, color: 0xa78bfa, statKey: "shootsSent" },
  wave: { api: "wave", verb: "waves at", needsTarget: false, color: 0x67e8f9, statKey: "wavesSent" },
  wink: { api: "wink", verb: "winks at", needsTarget: false, color: 0xf9a8d4, statKey: "winksSent" },
  smile: { api: "smile", verb: "smiles at", needsTarget: false, color: 0x86efac, statKey: "smilesSent" },
  blush: { api: "blush", verb: "blushes at", needsTarget: false, color: 0xfda4af, statKey: "blushesSent" },
  cry: { api: "cry", verb: "cries near", needsTarget: false, color: 0x93c5fd, statKey: "criesSent" },
  dance: { api: "dance", verb: "dances for", needsTarget: false, color: 0xc084fc, statKey: "dancesSent" },
  happy: { api: "happy", verb: "gets happy around", needsTarget: false, color: 0xfacc15, statKey: "happySent" },
  laugh: { api: "laugh", verb: "laughs with", needsTarget: false, color: 0xfbbf24, statKey: "laughsSent" },
  pout: { api: "pout", verb: "pouts at", needsTarget: false, color: 0xfda4af, statKey: "poutsSent" },
  smug: { api: "smug", verb: "looks smug at", needsTarget: false, color: 0xc4b5fd, statKey: "smugsSent" },
  baka: { api: "baka", verb: "calls", suffix: "a baka", needsTarget: true, color: 0xfca5a5, statKey: "bakasSent" },
  facepalm: { api: "facepalm", verb: "facepalms because of", needsTarget: false, color: 0xa3a3a3, statKey: "facepalmsSent" },
  yeet: { api: "yeet", verb: "yeets", needsTarget: true, color: 0xf97316, statKey: "yeetsSent" },
  nom: { api: "nom", verb: "noms on", needsTarget: true, color: 0xfb923c, statKey: "nomsSent" },
  stare: { api: "stare", verb: "stares at", needsTarget: false, color: 0x94a3b8, statKey: "staresSent" },
  spank: { api: "spank", verb: "spanks", needsTarget: true, color: 0xf472b6, statKey: "spanksSent" },
  shrug: { api: "shrug", verb: "shrugs at", needsTarget: false, color: 0xcbd5e1, statKey: "shrugsSent" },
};

const HELP_CATEGORIES = [
  {
    key: "roleplay",
    title: "Roleplay Commands",
    emoji: "💕",
    commands: ["hug", "kiss", "cuddle", "pat", "poke", "slap", "bite", "tickle", "bonk", "highfive", "handshake", "handhold", "feed", "punch", "shoot", "wave", "wink", "smile", "blush", "cry", "dance", "happy", "laugh", "pout", "smug", "baka", "facepalm", "yeet", "nom", "stare", "shrug", "marry", "divorce", "spank"],
  },
  {
    key: "game",
    title: "Game Commands",
    emoji: "🎲",
    commands: ["balance", "givecoins", "takecoins", "blackjack", "coinflip"],
  },
  {
    key: "admin",
    title: "Admin Commands",
    emoji: "🛡️",
    commands: ["mute", "unmute", "deafen", "undeafen", "timeout", "untimeout", "kick", "ban", "purge"],
  },
  {
    key: "personalisation",
    title: "Personalisation Commands",
    emoji: "🌷",
    commands: ["profile", "setbio", "setfavorite", "settitle", "setcolor"],
  },
];

const COMMAND_DETAILS = {
  help: {
    category: "general",
    usage: [`${PREFIX}help`, `${PREFIX}help <category>`, `${PREFIX}help <command>`],
    description: "Shows help categories, one category page, or detailed info for one command.",
    examples: [`${PREFIX}help roleplay`, `${PREFIX}help blackjack`],
  },
  marry: {
    category: "roleplay",
    usage: [`${PREFIX}marry @user`],
    description: "Send a marriage proposal that the tagged user can accept or decline.",
    examples: [`${PREFIX}marry @nez24`],
  },
  divorce: {
    category: "roleplay",
    usage: [`${PREFIX}divorce`],
    description: "Break your current marriage and clear the relationship for both people.",
    examples: [`${PREFIX}divorce`],
  },
  profile: {
    category: "profiles",
    usage: [`${PREFIX}profile`, `${PREFIX}profile @user`],
    description: "Shows a profile card with bio, balance, marriage info, roleplay stats, and game stats.",
    examples: [`${PREFIX}profile`, `${PREFIX}profile @nez24`],
  },
  setbio: {
    category: "profiles",
    usage: [`${PREFIX}setbio <text>`],
    description: "Updates your profile bio.",
    examples: [`${PREFIX}setbio i run this server and steal all the luck`],
  },
  setfavorite: {
    category: "profiles",
    usage: [`${PREFIX}setfavorite <text>`],
    description: "Sets your favorite thing on your profile.",
    examples: [`${PREFIX}setfavorite strawberry milk`],
  },
  settitle: {
    category: "profiles",
    usage: [`${PREFIX}settitle <text>`],
    description: "Sets the title shown on your profile card.",
    examples: [`${PREFIX}settitle Lucky Menace`],
  },
  setcolor: {
    category: "profiles",
    usage: [`${PREFIX}setcolor <#hex>`],
    description: "Changes your profile card color.",
    examples: [`${PREFIX}setcolor #ff8fab`],
  },
  balance: {
    category: "economy",
    usage: [`${PREFIX}balance`, `${PREFIX}balance @user`],
    description: "Checks coin balance quickly.",
    examples: [`${PREFIX}balance`, `${PREFIX}balance @nez24`],
  },
  givecoins: {
    category: "economy",
    usage: [`${PREFIX}givecoins @user <amount>`],
    description: "Admin-only command to give coins to a user.",
    examples: [`${PREFIX}givecoins @nez24 500`],
  },
  takecoins: {
    category: "economy",
    usage: [`${PREFIX}takecoins @user <amount>`],
    description: "Admin-only command to remove coins from a user.",
    examples: [`${PREFIX}takecoins @nez24 100`],
  },
  blackjack: {
    category: "games",
    usage: [`${PREFIX}blackjack <bet>`],
    description: "Bet coins in an interactive blackjack game with Hit and Stand buttons.",
    examples: [`${PREFIX}blackjack 100`, `${PREFIX}blackjack all`],
  },
  coinflip: {
    category: "games",
    usage: [`${PREFIX}coinflip <bet> <heads|tails>`],
    description: "Bet coins on a coin flip with a short animation and result GIF.",
    examples: [`${PREFIX}coinflip 50 heads`, `${PREFIX}coinflip all tails`],
  },
  mute: {
    category: "moderation",
    usage: [`${PREFIX}mute @user`],
    description: "Server-mutes a user in voice chat.",
    examples: [`${PREFIX}mute @user`],
  },
  unmute: {
    category: "moderation",
    usage: [`${PREFIX}unmute @user`],
    description: "Removes a voice mute.",
    examples: [`${PREFIX}unmute @user`],
  },
  deafen: {
    category: "moderation",
    usage: [`${PREFIX}deafen @user`],
    description: "Server-deafens a user in voice chat.",
    examples: [`${PREFIX}deafen @user`],
  },
  undeafen: {
    category: "moderation",
    usage: [`${PREFIX}undeafen @user`],
    description: "Removes a voice deafen.",
    examples: [`${PREFIX}undeafen @user`],
  },
  timeout: {
    category: "moderation",
    usage: [`${PREFIX}timeout @user <minutes> [reason]`],
    description: "Temporarily times out a member.",
    examples: [`${PREFIX}timeout @user 15 spamming`],
  },
  untimeout: {
    category: "moderation",
    usage: [`${PREFIX}untimeout @user`],
    description: "Removes a timeout from a member.",
    examples: [`${PREFIX}untimeout @user`],
  },
  kick: {
    category: "moderation",
    usage: [`${PREFIX}kick @user [reason]`],
    description: "Kicks a member from the server.",
    examples: [`${PREFIX}kick @user breaking rules`],
  },
  ban: {
    category: "moderation",
    usage: [`${PREFIX}ban @user [reason]`],
    description: "Bans a member from the server.",
    examples: [`${PREFIX}ban @user repeated spam`],
  },
  purge: {
    category: "moderation",
    usage: [`${PREFIX}purge <amount>`],
    description: "Deletes recent messages in the channel.",
    examples: [`${PREFIX}purge 15`],
  },
};

Object.keys(ROLEPLAY_COMMANDS).forEach((command) => {
  const config = ROLEPLAY_COMMANDS[command];
  const targetPhrase = config.needsTarget ? "the tagged user" : "the chat";
  COMMAND_DETAILS[command] = {
    category: "roleplay",
    usage: [config.needsTarget ? `${PREFIX}${command} @user` : `${PREFIX}${command} [@user]`],
    description: `${config.verb.charAt(0).toUpperCase()}${config.verb.slice(1)} ${targetPhrase}.`,
    examples: [config.needsTarget ? `${PREFIX}${command} @nez24` : `${PREFIX}${command}`],
  };
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }

  if (!fs.existsSync(MARRIAGE_FILE)) {
    fs.writeFileSync(MARRIAGE_FILE, "{}");
  }
}

function readJson(filePath, fallback) {
  try {
    ensureStorage();
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureStorage();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function buildMarriageAttachment(kind) {
  const asset = MARRIAGE_ASSETS[kind];
  return new AttachmentBuilder(asset.file, { name: asset.name });
}

function loadData() {
  const data = readJson(DATA_FILE, DEFAULT_DATA);
  return {
    profiles: data.profiles || {},
  };
}

function saveData(data) {
  writeJson(DATA_FILE, data);
}

function loadMarriages() {
  return readJson(MARRIAGE_FILE, {});
}

function saveMarriages(data) {
  writeJson(MARRIAGE_FILE, data);
}

function createDefaultProfile() {
  return {
    bio: "This user has not set up a profile yet.",
    favorite: "Nothing set yet",
    color: "#ff8fab",
    title: "Cutie",
    balance: 500,
    roleplayStats: {
      total: 0,
      hugsSent: 0,
      kissesSent: 0,
    },
    gameStats: {
      blackjackPlayed: 0,
      blackjackWon: 0,
      blackjackLost: 0,
      coinflipPlayed: 0,
      coinflipWon: 0,
      coinflipLost: 0,
    },
  };
}

function getOrCreateProfile(data, userId) {
  if (!data.profiles[userId]) {
    data.profiles[userId] = createDefaultProfile();
  }

  const profile = data.profiles[userId];
  profile.roleplayStats = {
    total: 0,
    hugsSent: 0,
    kissesSent: 0,
    ...(profile.roleplayStats || {}),
  };
  profile.gameStats = {
    blackjackPlayed: 0,
    blackjackWon: 0,
    blackjackLost: 0,
    coinflipPlayed: 0,
    coinflipWon: 0,
    coinflipLost: 0,
    ...(profile.gameStats || {}),
  };
  if (typeof profile.balance !== "number") {
    profile.balance = 500;
  }

  return profile;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRoleplayGif(category) {
  const response = await axios.get(`https://nekos.best/api/v2/${category}`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
    timeout: 10000,
  });

  const result = response.data && Array.isArray(response.data.results) ? response.data.results[0] : null;
  return result && result.url ? result.url : null;
}

function parseHexColor(value) {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }

  return Number.parseInt(value.slice(1), 16);
}

function hasPermission(member, permission) {
  return member.permissions.has(permission);
}

function requireMention(message, target) {
  if (!target) {
    message.reply("Tag someone first.");
    return false;
  }

  return true;
}

function normalizeBet(input, balance) {
  const raw = (input || "").toLowerCase();
  if (raw === "all") {
    return balance;
  }

  const amount = Number.parseInt(raw, 10);
  if (!Number.isInteger(amount) || amount < 1) {
    return null;
  }

  return amount;
}

function drawCard() {
  const faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  return randomItem(faces);
}

function handValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (["J", "Q", "K"].includes(card)) {
      total += 10;
    } else if (card === "A") {
      total += 11;
      aces += 1;
    } else {
      total += Number.parseInt(card, 10);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function chunkLines(lines, maxLength = 900) {
  const chunks = [];
  let current = [];
  let currentLength = 0;

  for (const line of lines) {
    const extraLength = (current.length ? 2 : 0) + line.length;
    if (current.length && currentLength + extraLength > maxLength) {
      chunks.push(current.join("\n\n"));
      current = [line];
      currentLength = line.length;
    } else {
      current.push(line);
      currentLength += extraLength;
    }
  }

  if (current.length) {
    chunks.push(current.join("\n\n"));
  }

  return chunks;
}

function buildHelpHomeEmbed() {
  return new EmbedBuilder()
    .setColor(0x241313)
    .setAuthor({ name: "Lmao Help Menu", iconURL: "https://i.imgur.com/T3m4mHi.png" })
    .setTitle("Help Categories")
    .setDescription([
      `Choose one of these: \`${PREFIX}help roleplay\`, \`${PREFIX}help game\`, \`${PREFIX}help admin\`, \`${PREFIX}help personalisation\``,
      "",
      `You can also use \`${PREFIX}help <command>\` for exact usage.`,
    ].join("\n"))
    .addFields(
      { name: "💕 Roleplay", value: "Hug, kiss, cuddle, marry, divorce, and all the cute action commands.", inline: false },
      { name: "🎲 Game", value: "Balance, coins, blackjack, and coinflip.", inline: false },
      { name: "🛡️ Admin", value: "Mute, deafen, timeout, ban, purge, and more.", inline: false },
      { name: "🌷 Personalisation", value: "Profiles, bios, favorite thing, title, and colors.", inline: false }
    )
    .setFooter({ text: `Prefix: ${PREFIX}` });
}

function buildCategoryHelpEmbeds(categoryKey) {
  const category = HELP_CATEGORIES.find((item) => item.key === categoryKey);
  if (!category) {
    return null;
  }

  const lines = category.commands.map((commandName) => {
    const detail = COMMAND_DETAILS[commandName];
    return `✨ **${detail.usage[0]}**\n${detail.description}`;
  });

  return chunkLines(lines).map((chunk, index) =>
    new EmbedBuilder()
      .setColor(0x241313)
      .setAuthor({ name: "Lmao Help Menu", iconURL: "https://i.imgur.com/T3m4mHi.png" })
      .setTitle(index === 0 ? `${category.emoji} ${category.title}` : `${category.emoji} ${category.title} Cont.`)
      .setDescription(chunk)
      .setFooter({ text: `Use ${PREFIX}help <command> for detailed usage` })
  );
}

function buildCommandHelpEmbed(commandName) {
  const detail = COMMAND_DETAILS[commandName];
  if (!detail) {
    return null;
  }

  return new EmbedBuilder()
    .setColor(0x241313)
    .setAuthor({ name: "Detailed Command Help", iconURL: "https://i.imgur.com/T3m4mHi.png" })
    .setTitle(`📘 ${commandName} Command`)
    .setDescription(detail.description)
    .addFields(
      {
        name: "🧾 Usage",
        value: detail.usage.map((entry) => `\`${entry}\``).join("\n"),
        inline: false,
      },
      {
        name: "💡 Examples",
        value: detail.examples.map((entry) => `\`${entry}\``).join("\n"),
        inline: false,
      }
    )
    .setFooter({ text: `Category: ${detail.category}` });
}

async function sendHelp(message, requestedCommand) {
  if (!requestedCommand) {
    await message.channel.send({ embeds: [buildHelpHomeEmbed()] });
    return;
  }

  const categoryEmbeds = buildCategoryHelpEmbeds(requestedCommand.toLowerCase());
  if (categoryEmbeds) {
    await message.channel.send({ embeds: categoryEmbeds });
    return;
  }

  const embed = buildCommandHelpEmbed(requestedCommand.toLowerCase());
  if (!embed) {
    await message.reply(`I do not have help info for \`${requestedCommand}\`. Try \`${PREFIX}help\`.`);
    return;
  }

  await message.channel.send({ embeds: [embed] });
}

async function handleRoleplay(message, command, target) {
  const config = ROLEPLAY_COMMANDS[command];
  if (!config) {
    return;
  }

  if (config.needsTarget && !requireMention(message, target)) {
    return;
  }

  if (target && target.id === message.author.id) {
    await message.reply("You cannot do that to yourself.");
    return;
  }

  const data = loadData();
  const profile = getOrCreateProfile(data, message.author.id);
  profile.roleplayStats.total += 1;
  profile.roleplayStats[config.statKey] = (profile.roleplayStats[config.statKey] || 0) + 1;
  saveData(data);

  let gifUrl = null;
  try {
    gifUrl = await fetchRoleplayGif(config.api);
  } catch (error) {
    console.error(`Failed to fetch roleplay GIF for ${command}:`, error.message);
  }

  const targetText = target ? `${target}` : "everyone";
  const suffixText = config.suffix ? ` ${config.suffix}` : "";
  const embed = new EmbedBuilder()
    .setColor(config.color || 0xff8fab)
    .setDescription(`${message.author} ${config.verb} ${targetText}${suffixText}`);

  if (gifUrl) {
    embed.setImage(gifUrl);
  }

  await message.channel.send({ embeds: [embed] });
}

async function handleMarry(message, target) {
  if (!requireMention(message, target)) {
    return;
  }

  if (target.id === message.author.id) {
    await message.reply("You cannot marry yourself.");
    return;
  }

  const marriages = loadMarriages();
  if (marriages[message.author.id]) {
    const spouse = marriages[message.author.id];
    const duration = formatDuration(Date.now() - spouse.date);
    await message.reply(`You are already married to <@${spouse.partner}> for ${duration}.`);
    return;
  }

  if (marriages[target.id]) {
    const spouse = marriages[target.id];
    const duration = formatDuration(Date.now() - spouse.date);
    await message.reply(`${target} is already married to <@${spouse.partner}> for ${duration}.`);
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`marry_accept_${message.author.id}_${target.id}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`marry_decline_${message.author.id}_${target.id}`)
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger)
  );

  const proposalEmbed = new EmbedBuilder()
    .setColor(0xff8fab)
    .setTitle("💍 Marriage Proposal")
    .setDescription(`${message.author} wants to marry ${target}.\n\n${target}, do you accept this proposal?`)
    .setImage(`attachment://${MARRIAGE_ASSETS.proposal.name}`)
    .setFooter({ text: "Only the tagged user can answer this proposal." });

  const proposalMessage = await message.channel.send({
    content: `${target}`,
    embeds: [proposalEmbed],
    files: [buildMarriageAttachment("proposal")],
    components: [row],
  });

  try {
    const interaction = await proposalMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (i) => i.user.id === target.id,
    });

    if (interaction.customId.startsWith("marry_decline_")) {
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff7f7f)
            .setTitle("💔 Proposal Declined")
            .setDescription(`${target} declined ${message.author}'s proposal.`)
            .setImage(`attachment://${MARRIAGE_ASSETS.rejected.name}`),
        ],
        files: [buildMarriageAttachment("rejected")],
        components: [],
      });
      return;
    }

    marriages[message.author.id] = { partner: target.id, date: Date.now() };
    marriages[target.id] = { partner: message.author.id, date: Date.now() };
    saveMarriages(marriages);

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle("💛 Newly Married")
          .setDescription(`${message.author} and ${target} are now married.`)
          .setImage(`attachment://${MARRIAGE_ASSETS.accepted.name}`),
      ],
      files: [buildMarriageAttachment("accepted")],
      components: [],
    });
  } catch (error) {
    await proposalMessage.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(0x94a3b8)
          .setTitle("⌛ Proposal Expired")
          .setDescription(`${target} did not respond to ${message.author}'s proposal in time.`)
          .setImage(`attachment://${MARRIAGE_ASSETS.rejected.name}`),
      ],
      files: [buildMarriageAttachment("rejected")],
      components: [],
    });
  }
}

async function handleDivorce(message) {
  const marriages = loadMarriages();
  const current = marriages[message.author.id];

  if (!current) {
    await message.reply("You are not married right now.");
    return;
  }

  delete marriages[message.author.id];
  delete marriages[current.partner];
  saveMarriages(marriages);

  await message.channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x94a3b8)
        .setTitle("💔 Divorce Finalized")
        .setDescription(`${message.author} is no longer married to <@${current.partner}>.`),
    ],
  });
}

function getMarriageLine(userId, marriages) {
  const spouse = marriages[userId];
  if (!spouse) {
    return "Single";
  }

  return `<@${spouse.partner}> for ${formatDuration(Date.now() - spouse.date)}`;
}

async function handleProfile(message, targetUser) {
  const data = loadData();
  const profile = getOrCreateProfile(data, targetUser.id);
  saveData(data);

  const marriages = loadMarriages();
  const roleplayStats = profile.roleplayStats;
  const gameStats = profile.gameStats;
  const color = parseHexColor(profile.color) || 0xff8fab;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: `${targetUser.username}'s Profile`, iconURL: targetUser.displayAvatarURL() })
    .setTitle(`🌷 ${profile.title || "Cutie"}`)
    .setDescription(profile.bio || "No bio set")
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      {
        name: "👤 Profile",
        value: [
          `**Favorite:** ${profile.favorite || "Nothing set yet"}`,
          `**Balance:** ${profile.balance} coins`,
          `**Married To:** ${getMarriageLine(targetUser.id, marriages)}`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "💕 Roleplay Stats",
        value: [
          `**Total Actions:** ${roleplayStats.total || 0}`,
          `**Hugs:** ${roleplayStats.hugsSent || 0}`,
          `**Kisses:** ${roleplayStats.kissesSent || 0}`,
        ].join("\n"),
        inline: true,
      },
      {
        name: "🎲 Game Stats",
        value: [
          `**Blackjack:** ${gameStats.blackjackWon || 0}W / ${gameStats.blackjackLost || 0}L`,
          `**Coinflip:** ${gameStats.coinflipWon || 0}W / ${gameStats.coinflipLost || 0}L`,
          `**Games Played:** ${(gameStats.blackjackPlayed || 0) + (gameStats.coinflipPlayed || 0)}`,
        ].join("\n"),
        inline: true,
      }
    )
    .setFooter({ text: `Use ${PREFIX}help <command> for detailed command info` });

  await message.channel.send({ embeds: [embed] });
}

async function handleBalance(message, targetUser) {
  const data = loadData();
  const profile = getOrCreateProfile(data, targetUser.id);
  saveData(data);

  const embed = new EmbedBuilder()
    .setColor(0xf6c453)
    .setTitle("🪙 Balance")
    .setDescription(`${targetUser} has **${profile.balance}** coins.`);

  await message.channel.send({ embeds: [embed] });
}

async function handleSetProfileField(message, field, value, successText) {
  if (!value) {
    await message.reply("You need to provide a value for that command.");
    return;
  }

  const data = loadData();
  const profile = getOrCreateProfile(data, message.author.id);
  profile[field] = value;
  saveData(data);
  await message.reply(successText);
}

async function handleCoinAdmin(message, targetUser, amountText, mode) {
  if (!requireMention(message, targetUser)) {
    return;
  }

  if (!hasPermission(message.member, PermissionsBitField.Flags.Administrator)) {
    await message.reply("Only admins can change other users' coins.");
    return;
  }

  const amount = Number.parseInt(amountText, 10);
  if (!Number.isInteger(amount) || amount < 1) {
    await message.reply("Give a valid positive amount.");
    return;
  }

  const data = loadData();
  const profile = getOrCreateProfile(data, targetUser.id);

  if (mode === "add") {
    profile.balance += amount;
    saveData(data);
    await message.channel.send(`Gave ${amount} coins to ${targetUser}. New balance: ${profile.balance}.`);
    return;
  }

  profile.balance = Math.max(0, profile.balance - amount);
  saveData(data);
  await message.channel.send(`Removed ${amount} coins from ${targetUser}. New balance: ${profile.balance}.`);
}

function buildBlackjackEmbed(message, bet, playerHand, dealerHand, status, revealDealer) {
  const playerTotal = handValue(playerHand);
  const dealerCards = revealDealer ? dealerHand.join(" , ") : `${dealerHand[0]} , ?`;
  const dealerTotalText = revealDealer ? ` (${handValue(dealerHand)})` : "";

  return new EmbedBuilder()
    .setColor(0x1f7a4d)
    .setTitle("🃏 Blackjack Table")
    .setDescription(
      `Player: ${message.author}\nBet: **${bet}** coins\n\n` +
      `**Your Hand:** ${playerHand.join(" , ")} (${playerTotal})\n` +
      `**Dealer Hand:** ${dealerCards}${dealerTotalText}\n\n` +
      `${status}`
    );
}

async function handleBlackjack(message, betText) {
  const data = loadData();
  const profile = getOrCreateProfile(data, message.author.id);
  const bet = normalizeBet(betText, profile.balance);

  if (!bet || bet > profile.balance) {
    await message.reply(`Use a valid bet that you can afford. Example: \`${PREFIX}blackjack 100\` or \`${PREFIX}blackjack all\`.`);
    return;
  }

  const playerHand = [drawCard(), drawCard()];
  const dealerHand = [drawCard(), drawCard()];
  profile.gameStats.blackjackPlayed += 1;
  saveData(data);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`blackjack_hit_${message.author.id}`).setLabel("Hit").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`blackjack_stand_${message.author.id}`).setLabel("Stand").setStyle(ButtonStyle.Success)
  );

  const statusMessage = await message.channel.send({
    embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "Choose **Hit** or **Stand**.", false)],
    components: [row],
  });

  const finishGame = async (title, description, color, gif) => {
    saveData(data);
    await statusMessage.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setDescription(
            `**Your Hand:** ${playerHand.join(" , ")} (${handValue(playerHand)})\n` +
            `**Dealer Hand:** ${dealerHand.join(" , ")} (${handValue(dealerHand)})\n\n` +
            `${description}\nBalance: **${profile.balance}** coins`
          )
          .setImage(gif),
      ],
      components: [],
    });
  };

  const collector = statusMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.user.id !== message.author.id) {
      await interaction.reply({ content: "This blackjack game belongs to someone else.", ephemeral: true });
      return;
    }

    if (interaction.customId.startsWith("blackjack_hit_")) {
      playerHand.push(drawCard());
      const playerTotal = handValue(playerHand);

      if (playerTotal > 21) {
        profile.balance -= bet;
        profile.gameStats.blackjackLost += 1;
        collector.stop("bust");
        await interaction.update({
          embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "You busted.", true)],
          components: [],
        });
        await finishGame("💥 Bust", `You lost **${bet}** coins.`, 0xff7f7f, randomItem(MEDIA_GIFS.blackjackLose));
        return;
      }

      await interaction.update({
        embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "You drew a card. Hit again or stand.", false)],
        components: [row],
      });
      return;
    }

    while (handValue(dealerHand) < 17) {
      dealerHand.push(drawCard());
    }

    const playerTotal = handValue(playerHand);
    const dealerTotal = handValue(dealerHand);
    collector.stop("stand");

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      profile.balance += bet;
      profile.gameStats.blackjackWon += 1;
      await interaction.update({
        embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "You beat the dealer.", true)],
        components: [],
      });
      await finishGame("🏆 Blackjack Win", `You won **${bet}** coins.`, 0x7ef29a, randomItem(MEDIA_GIFS.blackjackWin));
      return;
    }

    if (dealerTotal === playerTotal) {
      await interaction.update({
        embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "Push.", true)],
        components: [],
      });
      await finishGame("🤝 Push", `You tied and kept your **${bet}** coins.`, 0xf6c453, randomItem(MEDIA_GIFS.blackjackPush));
      return;
    }

    profile.balance -= bet;
    profile.gameStats.blackjackLost += 1;
    await interaction.update({
      embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "Dealer wins.", true)],
      components: [],
    });
    await finishGame("💸 Dealer Wins", `You lost **${bet}** coins.`, 0xff7f7f, randomItem(MEDIA_GIFS.blackjackLose));
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      try {
        await statusMessage.edit({
          embeds: [buildBlackjackEmbed(message, bet, playerHand, dealerHand, "Game expired. Start a new one with `!blackjack`.", false)],
          components: [],
        });
      } catch (error) {
        console.error("Failed to expire blackjack game:", error.message);
      }
    }
  });
}

async function handleCoinflip(message, betText, choiceText) {
  const data = loadData();
  const profile = getOrCreateProfile(data, message.author.id);
  const bet = normalizeBet(betText, profile.balance);
  const choice = (choiceText || "").toLowerCase();

  if (!bet || bet > profile.balance) {
    await message.reply(`Use a valid bet that you can afford. Example: \`${PREFIX}coinflip 100 heads\`.`);
    return;
  }

  if (!["heads", "tails"].includes(choice)) {
    await message.reply("Choose either `heads` or `tails`.");
    return;
  }

  const statusMessage = await message.channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x7a5cff)
        .setTitle("Coinflip")
        .setDescription(`Bet: **${bet}** coins\nChoice: **${choice}**\n\nFlipping the coin...`),
    ],
  });

  await sleep(800);
  await statusMessage.edit({
    embeds: [
      new EmbedBuilder()
        .setColor(0x7a5cff)
        .setTitle("Coinflip")
        .setDescription(`Bet: **${bet}** coins\nChoice: **${choice}**\n\nThe coin is still spinning...`),
    ],
  });

  await sleep(900);

  const result = Math.random() < 0.5 ? "heads" : "tails";
  profile.gameStats.coinflipPlayed += 1;

  let embed;
  if (choice === result) {
    profile.balance += bet;
    profile.gameStats.coinflipWon += 1;
    embed = new EmbedBuilder()
      .setColor(0x7ef29a)
      .setTitle("Coinflip Win")
      .setDescription(`It landed on **${result}**.\nYou won **${bet}** coins.\nBalance: **${profile.balance}** coins`)
      .setImage(randomItem(MEDIA_GIFS.coinflipWin));
  } else {
    profile.balance -= bet;
    profile.gameStats.coinflipLost += 1;
    embed = new EmbedBuilder()
      .setColor(0xff7f7f)
      .setTitle("Coinflip Loss")
      .setDescription(`It landed on **${result}**.\nYou lost **${bet}** coins.\nBalance: **${profile.balance}** coins`)
      .setImage(randomItem(MEDIA_GIFS.coinflipLose));
  }

  saveData(data);
  await statusMessage.edit({ embeds: [embed] });
}

async function handleMuteLike(message, targetMember, action, permission) {
  if (!requireMention(message, targetMember)) {
    return;
  }

  if (!hasPermission(message.member, permission)) {
    await message.reply("You do not have permission to use that command.");
    return;
  }

  if (!targetMember.voice || !targetMember.voice.channel) {
    await message.reply("That user is not in a voice channel.");
    return;
  }

  if (action === "mute") {
    await targetMember.voice.setMute(true, `Muted by ${message.author.tag}`);
    await message.channel.send(`Muted ${targetMember}.`);
  } else if (action === "unmute") {
    await targetMember.voice.setMute(false, `Unmuted by ${message.author.tag}`);
    await message.channel.send(`Unmuted ${targetMember}.`);
  } else if (action === "deafen") {
    await targetMember.voice.setDeaf(true, `Deafened by ${message.author.tag}`);
    await message.channel.send(`Deafened ${targetMember}.`);
  } else if (action === "undeafen") {
    await targetMember.voice.setDeaf(false, `Undeafened by ${message.author.tag}`);
    await message.channel.send(`Undeafened ${targetMember}.`);
  }
}

async function handleTimeout(message, targetMember, minutesText, reasonText) {
  if (!requireMention(message, targetMember)) {
    return;
  }

  if (!hasPermission(message.member, PermissionsBitField.Flags.ModerateMembers)) {
    await message.reply("You do not have permission to timeout members.");
    return;
  }

  const minutes = Number.parseInt(minutesText, 10);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 40320) {
    await message.reply("Give a timeout length in minutes between 1 and 40320.");
    return;
  }

  const reason = reasonText || "No reason provided";
  await targetMember.timeout(minutes * 60 * 1000, reason);
  await message.channel.send(`Timed out ${targetMember} for ${minutes} minute(s). Reason: ${reason}`);
}

async function handleUntimeout(message, targetMember) {
  if (!requireMention(message, targetMember)) {
    return;
  }

  if (!hasPermission(message.member, PermissionsBitField.Flags.ModerateMembers)) {
    await message.reply("You do not have permission to remove timeouts.");
    return;
  }

  await targetMember.timeout(null, `Timeout removed by ${message.author.tag}`);
  await message.channel.send(`Removed timeout for ${targetMember}.`);
}

async function handleKick(message, targetMember, reasonText) {
  if (!requireMention(message, targetMember)) {
    return;
  }

  if (!hasPermission(message.member, PermissionsBitField.Flags.KickMembers)) {
    await message.reply("You do not have permission to kick members.");
    return;
  }

  await targetMember.kick(reasonText || "No reason provided");
  await message.channel.send(`Kicked ${targetMember}.`);
}

async function handleBan(message, targetMember, reasonText) {
  if (!requireMention(message, targetMember)) {
    return;
  }

  if (!hasPermission(message.member, PermissionsBitField.Flags.BanMembers)) {
    await message.reply("You do not have permission to ban members.");
    return;
  }

  await targetMember.ban({ reason: reasonText || "No reason provided" });
  await message.channel.send(`Banned ${targetMember}.`);
}

async function handlePurge(message, amountText) {
  if (!hasPermission(message.member, PermissionsBitField.Flags.ManageMessages)) {
    await message.reply("You do not have permission to purge messages.");
    return;
  }

  const amount = Number.parseInt(amountText, 10);
  if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
    await message.reply("Give a number from 1 to 100.");
    return;
  }

  const deleted = await message.channel.bulkDelete(amount + 1, true);
  const notice = await message.channel.send(`Deleted ${deleted.size - 1} message(s).`);
  setTimeout(() => {
    notice.delete().catch(() => {});
  }, 5000);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) {
    return;
  }

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = (args.shift() || "").toLowerCase();
  const targetMember = message.mentions.members.first();
  const targetUser = message.mentions.users.first();
  const rest = args.join(" ").trim();

  try {
    if (command === "help") {
      await sendHelp(message, args[0]);
      return;
    }

    if (ROLEPLAY_COMMANDS[command]) {
      await handleRoleplay(message, command, targetUser);
      return;
    }

    if (command === "cute") {
      const cuteMessages = [
        "The server feels extra cozy today.",
        "A tiny crown has been placed gently on your head.",
        "Soft vibes deployed successfully.",
        "The bot thinks you are doing great.",
      ];
      await message.channel.send(randomItem(cuteMessages));
      return;
    }

    if (command === "marry") {
      await handleMarry(message, targetUser);
      return;
    }

    if (command === "divorce") {
      await handleDivorce(message);
      return;
    }

    if (command === "profile") {
      await handleProfile(message, targetUser || message.author);
      return;
    }

    if (command === "balance") {
      await handleBalance(message, targetUser || message.author);
      return;
    }

    if (command === "setbio") {
      await handleSetProfileField(message, "bio", rest.slice(0, 200), "Your bio has been updated.");
      return;
    }

    if (command === "setfavorite") {
      await handleSetProfileField(message, "favorite", rest.slice(0, 100), "Your favorite thing has been updated.");
      return;
    }

    if (command === "settitle") {
      await handleSetProfileField(message, "title", rest.slice(0, 50), "Your profile title has been updated.");
      return;
    }

    if (command === "setcolor") {
      const colorValue = parseHexColor(args[0] || "");
      if (colorValue === null) {
        await message.reply("Use a valid hex color like `#ff8fab`.");
        return;
      }

      const data = loadData();
      const profile = getOrCreateProfile(data, message.author.id);
      profile.color = args[0];
      saveData(data);
      await message.reply(`Your profile color is now ${args[0]}.`);
      return;
    }

    if (command === "givecoins") {
      await handleCoinAdmin(message, targetUser, args[1], "add");
      return;
    }

    if (command === "takecoins") {
      await handleCoinAdmin(message, targetUser, args[1], "take");
      return;
    }

    if (command === "blackjack") {
      await handleBlackjack(message, args[0]);
      return;
    }

    if (command === "coinflip") {
      await handleCoinflip(message, args[0], args[1]);
      return;
    }

    if (command === "mute") {
      await handleMuteLike(message, targetMember, "mute", PermissionsBitField.Flags.MuteMembers);
      return;
    }

    if (command === "unmute") {
      await handleMuteLike(message, targetMember, "unmute", PermissionsBitField.Flags.MuteMembers);
      return;
    }

    if (command === "deafen") {
      await handleMuteLike(message, targetMember, "deafen", PermissionsBitField.Flags.DeafenMembers);
      return;
    }

    if (command === "undeafen") {
      await handleMuteLike(message, targetMember, "undeafen", PermissionsBitField.Flags.DeafenMembers);
      return;
    }

    if (command === "timeout") {
      await handleTimeout(message, targetMember, args[1], args.slice(2).join(" "));
      return;
    }

    if (command === "untimeout") {
      await handleUntimeout(message, targetMember);
      return;
    }

    if (command === "kick") {
      await handleKick(message, targetMember, args.slice(1).join(" "));
      return;
    }

    if (command === "ban") {
      await handleBan(message, targetMember, args.slice(1).join(" "));
      return;
    }

    if (command === "purge") {
      await handlePurge(message, args[0]);
      return;
    }

    await message.reply(`Unknown command. Use \`${PREFIX}help\` to see what I can do.`);
  } catch (error) {
    console.error(`Command failed: ${command}`, error);
    await message.reply("Something went wrong while running that command.");
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

if (!TOKEN) {
  console.error("No DISCORD_TOKEN environment variable set. Set it and re-run.");
  process.exit(1);
}

ensureStorage();
client.login(TOKEN).catch((error) => {
  console.error("Login failed:", error);
});
