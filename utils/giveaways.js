const { readJSON, writeJSON } = require('./storage');
const FILE = 'giveaways.json';

function save(guildId, messageId, data) {
  const all = readJSON(FILE, {});
  if (!all[guildId]) all[guildId] = {};
  all[guildId][messageId] = data;
  writeJSON(FILE, all);
}

function get(guildId, messageId) {
  const all = readJSON(FILE, {});
  return all[guildId]?.[messageId] || null;
}

function remove(guildId, messageId) {
  const all = readJSON(FILE, {});
  if (all[guildId]) {
    delete all[guildId][messageId];
    writeJSON(FILE, all);
  }
}

function allActive() {
  return readJSON(FILE, {});
}

module.exports = { save, get, remove, allActive };
