const { readJSON, writeJSON } = require('./storage');
const FILE = 'birthdays.json';

function set(guildId, userId, month, day) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  data[guildId][userId] = { month, day };
  writeJSON(FILE, data);
}

function get(guildId, userId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[userId] || null;
}

function today(guildId) {
  const data = readJSON(FILE, {});
  const guild = data[guildId] || {};
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return Object.entries(guild)
    .filter(([, v]) => v.month === m && v.day === d)
    .map(([id]) => id);
}

module.exports = { set, get, today };
