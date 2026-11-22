const { readJSON, writeJSON } = require('./storage');
const FILE = 'invites.json';

// cache: guildId -> Map<code, uses>
const cache = new Map();

function setCache(guildId, map) {
  cache.set(guildId, map);
}

function getCache(guildId) {
  return cache.get(guildId) || new Map();
}

function addInviteCredit(guildId, inviterId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][inviterId]) data[guildId][inviterId] = { joins: 0 };
  data[guildId][inviterId].joins++;
  writeJSON(FILE, data);
  return data[guildId][inviterId].joins;
}

function leaderboard(guildId, limit = 10) {
  const data = readJSON(FILE, {});
  const guild = data[guildId] || {};
  return Object.entries(guild)
    .map(([id, v]) => ({ id, joins: v.joins || 0 }))
    .sort((a, b) => b.joins - a.joins)
    .slice(0, limit);
}

function getUser(guildId, userId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[userId]?.joins || 0;
}

module.exports = { setCache, getCache, addInviteCredit, leaderboard, getUser };
