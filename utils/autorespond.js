const { readJSON, writeJSON } = require('./storage');
const FILE = 'autorespond.json';

function list(guildId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = [];
  return { data, list: data[guildId] };
}

function add(guildId, trigger, response) {
  const { data, list } = list(guildId);
  const t = trigger.toLowerCase().trim();
  const existing = list.find(x => x.trigger === t);
  if (existing) {
    existing.response = response;
  } else {
    list.push({ trigger: t, response });
  }
  writeJSON(FILE, data);
  return list;
}

function remove(guildId, trigger) {
  const { data, list } = list(guildId);
  const t = trigger.toLowerCase().trim();
  const idx = list.findIndex(x => x.trigger === t);
  if (idx === -1) return null;
  list.splice(idx, 1);
  writeJSON(FILE, data);
  return list;
}

function match(guildId, content) {
  const { list } = list(guildId);
  const lower = content.toLowerCase();
  return list.find(x => lower.includes(x.trigger)) || null;
}

module.exports = { add, remove, list, match };
