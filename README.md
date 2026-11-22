# RATZ BOT

Full-featured Discord community bot for **RATZ**.

## Feature groups

- **Levels** – XP, rank, leaderboard, level-up channel, level roles
- **Economy** – cheese coins, daily, work, pay, leaderboard
- **Tickets** – support + ban appeals, staff apps (modal)
- **Verification** – gate + auto-role + welcome DM
- **Protection** – anti-raid, raid mode, alt detection, automod, NSFW filter, live blacklist, voice mod, channel modes
- **Community** – suggestions, giveaways, starboard, LFG, lobby codes, sticky, birthdays, AFK, reminders, snipe, invites
- **Voice** – auto-join, temp VCs
- **Roles** – reaction roles + select menus
- **Logging** – mod log + message delete/edit log
- **Fun** – rat commands, 8ball, coinflip

## Hosting on Render

See **[RENDER.md](./RENDER.md)** for a full step-by-step deploy on [render.com](https://render.com).

## Setup

```bash
npm install
cp .env.example .env   # DISCORD_TOKEN, CLIENT_ID, GUILD_ID
npm run deploy
npm start
```

Enable **Server Members** + **Message Content** intents. Prefer Administrator permission for setup.

### First commands

```
/setlogchannel #mod-logs
/setmessagelog #message-logs
/setstarboard #starboard
/setticketcategory category:#Tickets
/ticketpanel
/appealpanel
/setverification unverified:@Unverified member:@Member
/tempvoice trigger:#Create-VC
/lfgpanel
/config
```

Stay sharp. Stay Ratz. 🐀
