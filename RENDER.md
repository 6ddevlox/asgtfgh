# Deploy RATZ BOT on Render

## 1. Push the bot to GitHub
Create a repo and upload everything INSIDE the `ratz-bot` folder (so `index.js` and `package.json` sit at the top of the repo).

**Important:** GitHub's website only accepts 100 files per upload and silently drops the rest, which causes errors like `Cannot find module './utils/tickets'`. This bot has ~120 files, so either:
- upload in two batches (e.g. `commands` + `events` first, then everything else), or
- use git / GitHub Desktop (no limit):
```bash
git init
git add .
git commit -m "RATZ BOT"
git branch -M main
git remote add origin https://github.com/YOURNAME/YOURREPO.git
git push -u origin main --force
```
Afterwards check the repo has `utils/` (24 files), `events/` (8 files) and all 8 folders in `commands/`.

## 2. Create a Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `ratz-bot`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance type:** Free

## 3. Environment variables
In the Render service → **Environment**, add:

| Key | Value |
|-----|--------|
| `DISCORD_TOKEN` | Your bot token |
| `CLIENT_ID` | Application client ID |
| `GUILD_ID` | Your Discord server ID |
| `NODE_VERSION` | `20` |

## 4. Deploy slash commands (one time)
After the first successful deploy, either:

**Option A — Locally (easiest)**  
On your PC with the same `.env`:
```bash
npm run deploy
```

**Option B — Render Shell**  
Open the service → **Shell**, then:
```bash
node deploy-commands.js
```

## 5. Discord Developer Portal
- Enable **Server Members Intent**
- Enable **Message Content Intent**
- Invite the bot with Administrator (or needed permissions)

## Notes
- The bot opens a small HTTP server on Render’s `PORT` so the free Web Service stays healthy.
- Free tier can sleep after inactivity on some setups; if the bot goes offline, upgrade to a paid instance or use a free uptime ping on your Render URL.
- `data/` JSON files (levels, warns, etc.) **reset when Render rebuilds** the service. For permanent storage later, add a Render Disk or switch to a database.

## Optional: Blueprint deploy
If the repo has `render.yaml`, you can use **New → Blueprint** and Render will read it automatically.
