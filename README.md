# Discord Admin + Roleplay Bot

This bot now includes:

- A redesigned `!help` menu with category spacing and detailed command help
- Roleplay commands with random GIFs from the free `nekos.best` API
- Custom profiles that hold your stats and coin balance
- Admin-only currency control
- Coinflip and blackjack games with short embed animations and result GIFs
- Moderation commands for mute, deafen, timeout, kick, ban, and purge

## Main Commands

- `!help`
- `!help <command>`
- `!profile [@user]`
- `!balance [@user]`
- `!setbio <text>`
- `!setfavorite <text>`
- `!settitle <text>`
- `!setcolor <#hex>`
- `!givecoins @user <amount>`
- `!takecoins @user <amount>`
- `!blackjack <bet>`
- `!coinflip <bet> <heads|tails>`

## Roleplay Commands

- `!hug @user`
- `!kiss @user`
- `!cuddle @user`
- `!pat @user`
- `!poke @user`
- `!slap @user`
- `!bite @user`
- `!tickle @user`
- `!bonk @user`
- `!highfive @user`
- `!handshake @user`
- `!handhold @user`
- `!feed @user`
- `!punch @user`
- `!shoot @user`
- `!wave [@user]`
- `!wink [@user]`
- `!smile [@user]`
- `!blush [@user]`
- `!cry [@user]`
- `!dance [@user]`
- `!happy [@user]`
- `!laugh [@user]`
- `!pout [@user]`
- `!smug [@user]`
- `!baka @user`
- `!facepalm [@user]`
- `!yeet @user`
- `!nom @user`
- `!stare [@user]`
- `!shrug [@user]`
- `!marry @user`

## Moderation Commands

- `!mute @user`
- `!unmute @user`
- `!deafen @user`
- `!undeafen @user`
- `!timeout @user <minutes> [reason]`
- `!untimeout @user`
- `!kick @user [reason]`
- `!ban @user [reason]`
- `!purge <amount>`

## Setup

1. Install Node.js 18 or newer.
2. In the Discord Developer Portal, enable:
   - Message Content Intent
   - Server Members Intent
3. Invite the bot with the permissions you want it to use.
4. Install dependencies:

```powershell
npm install
```

5. Create `.env`:

```env
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
```

6. Start the bot:

```powershell
npm start
```

## Notes

- Profile data, balances, and game stats are stored in `data/bot-data.json`.
- Marriage data is stored in `data/marriage.json`.
- Roleplay GIFs are fetched from [nekos.best docs](https://docs.nekos.best/).
- Roleplay counters are no longer shown on the roleplay embeds themselves. You see them inside `!profile`.
