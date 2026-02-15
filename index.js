const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN || null;
const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

console.log("Index.js starting...");

// Simple in-memory dedupe to avoid processing the same message multiple times
const processedMessages = new Set();

const gifs = {
  kiss: [
    "https://media.tenor.com/ZRsg2sLkY4AAAAAC/anime-kiss.gif",
    "https://media.tenor.com/gUiu1zyxfzYAAAAi/anime-kissing.gif",
    "https://media.tenor.com/wO0k9H5XcXkAAAAC/anime-romantic-kiss.gif",
  ],
  hug: [
    "https://media.tenor.com/6XgR8aR9V0sAAAAC/anime-hug.gif",
    "https://media.tenor.com/9uYjvO4T6zAAAAAC/anime-cuddle.gif",
  ],
  marry: [
    "https://media.tenor.com/YG6K3F0p6QkAAAAC/anime-wedding.gif",
    "https://media.tenor.com/Wt6oX2YvA7QAAAAC/anime-propose.gif",
  ],
};

const marriageFile = "./marriage.json";
function loadMarriages() {
  try {
    if (!fs.existsSync(marriageFile)) fs.writeFileSync(marriageFile, "{}");
    return JSON.parse(fs.readFileSync(marriageFile, "utf8") || "{}");
  } catch (e) {
    console.error("Failed to load marriages:", e);
    return {};
  }
}
function saveMarriages(data) {
  try {
    fs.writeFileSync(marriageFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save marriages:", e);
  }
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  // Deduplicate
  if (processedMessages.has(message.id)) return;
  processedMessages.add(message.id);
  setTimeout(() => processedMessages.delete(message.id), 5000);

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const target = message.mentions.users.first();

  if (["kiss", "hug"].includes(command)) {
    if (!target) return message.reply("Tag someone 😭");
    if (target.id === message.author.id)
      return message.reply("You cannot do that to yourself 😭");

    const randomGif = gifs[command][Math.floor(Math.random() * gifs[command].length)];
    const responses = {
      kiss: `${message.author} kisses ${target} 💋`,
      hug: `${message.author} hugs ${target} 🤗`,
    };

    const embed = new EmbedBuilder().setDescription(responses[command]).setImage(randomGif).setColor(0xff69b4);

    try {
      await message.channel.send({ embeds: [embed] });
      console.log(`Sent ${command} embed for ${message.id}`);
    } catch (err) {
      console.error("Failed to send embed:", err);
      try {
        await message.channel.send(responses[command]);
      } catch (err2) {
        console.error("Fallback send also failed:", err2);
      }
    }
    return;
  }

  if (command === "marry") {
    if (!target) return message.reply("Tag someone to marry 💍");
    if (target.id === message.author.id) return message.reply("You cannot marry yourself 😭");

    const marriages = loadMarriages();
    if (marriages[message.author.id]) {
      const spouse = marriages[message.author.id];
      const duration = formatDuration(Date.now() - spouse.date);
      return message.reply(`You are already married to <@${spouse.partner}> ❤️ (for ${duration})`);
    }

    marriages[message.author.id] = { partner: target.id, date: Date.now() };
    marriages[target.id] = { partner: message.author.id, date: Date.now() };
    saveMarriages(marriages);

    const embed = new EmbedBuilder().setDescription(`${message.author} is now married to ${target} 💍`).setImage(gifs.marry[0]).setColor(0xffd700);
    try {
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Failed to send marry embed:", err);
      message.channel.send(`💍 ${message.author} is now married to ${target}!`);
    }
    return;
  }

  if (command === "blackjack") {
    message.channel.send("Blackjack is not implemented yet.");
    return;
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

process.on("unhandledRejection", (err) => console.error("Unhandled promise rejection:", err));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

if (!TOKEN) {
  console.error("No DISCORD_TOKEN environment variable set. Set it and re-run.");
  process.exit(1);
}

client.login(TOKEN).catch((err) => console.error("Login failed:", err));
