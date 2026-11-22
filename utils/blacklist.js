const { readJSON, writeJSON } = require('./storage');

const FILE = 'blacklist.json';

function getList(guildId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = [];
  return { data, list: data[guildId] };
}

function addPhrase(guildId, phrase) {
  const { data, list } = getList(guildId);
  const p = phrase.toLowerCase().trim();
  if (!p || list.includes(p)) return { added: false, list };
  list.push(p);
  writeJSON(FILE, data);
  return { added: true, list };
}

function removePhrase(guildId, phrase) {
  const { data, list } = getList(guildId);
  const p = phrase.toLowerCase().trim();
  const idx = list.indexOf(p);
  if (idx === -1) return { removed: false, list };
  list.splice(idx, 1);
  writeJSON(FILE, data);
  return { removed: true, list };
}

function containsBlacklisted(guildId, content) {
  const { list } = getList(guildId);
  if (!list.length) return null;
  const lower = content.toLowerCase();
  return list.find(p => lower.includes(p)) || null;
}

module.exports = { addPhrase, removePhrase, getList, containsBlacklisted };
