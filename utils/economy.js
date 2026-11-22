const { readJSON, writeJSON } = require('./storage');
const FILE = 'economy.json';

function get(guildId, userId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { coins: 0, lastDaily: 0, lastWork: 0 };
  return { data, user: data[guildId][userId] };
}

function addCoins(guildId, userId, amount) {
  const { data, user } = get(guildId, userId);
  user.coins = Math.max(0, (user.coins || 0) + amount);
  writeJSON(FILE, data);
  return user.coins;
}

function setDaily(guildId, userId) {
  const { data, user } = get(guildId, userId);
  user.lastDaily = Date.now();
  writeJSON(FILE, data);
}

function setWork(guildId, userId) {
  const { data, user } = get(guildId, userId);
  user.lastWork = Date.now();
  writeJSON(FILE, data);
}

function leaderboard(guildId, limit = 10) {
  const data = readJSON(FILE, {});
  const guild = data[guildId] || {};
  return Object.entries(guild)
    .map(([id, u]) => ({ id, coins: u.coins || 0 }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, limit);
}

module.exports = { get, addCoins, setDaily, setWork, leaderboard };
