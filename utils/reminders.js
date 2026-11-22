const { readJSON, writeJSON } = require('./storage');
const FILE = 'reminders.json';

function add(userId, channelId, guildId, text, when) {
  const data = readJSON(FILE, { items: [] });
  if (!data.items) data.items = [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  data.items.push({ id, userId, channelId, guildId, text, when });
  writeJSON(FILE, data);
  return id;
}

function due(now = Date.now()) {
  const data = readJSON(FILE, { items: [] });
  const items = data.items || [];
  const ready = items.filter(i => i.when <= now);
  const rest = items.filter(i => i.when > now);
  data.items = rest;
  writeJSON(FILE, data);
  return ready;
}

module.exports = { add, due };
