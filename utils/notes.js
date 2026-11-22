const { readJSON, writeJSON } = require('./storage');
const FILE = 'notes.json';

function add(guildId, userId, modId, text) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = [];
  data[guildId][userId].push({ text, modId, at: Date.now() });
  writeJSON(FILE, data);
  return data[guildId][userId];
}

function get(guildId, userId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[userId] || [];
}

function clear(guildId, userId) {
  const data = readJSON(FILE, {});
  if (data[guildId]) data[guildId][userId] = [];
  writeJSON(FILE, data);
}

module.exports = { add, get, clear };
