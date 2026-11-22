const { readJSON, writeJSON } = require('./storage');

const FILE = 'warns.json';

function getAll() {
  return readJSON(FILE, {});
}

function getUserWarns(guildId, userId) {
  const data = getAll();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = [];
  return { data, warns: data[guildId][userId] };
}

function addWarn(guildId, userId, moderatorId, reason) {
  const { data, warns } = getUserWarns(guildId, userId);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    reason: reason || 'No reason provided',
    moderatorId,
    at: Date.now(),
  };
  warns.push(entry);
  writeJSON(FILE, data);
  return { warns, entry };
}

function clearWarns(guildId, userId) {
  const data = getAll();
  if (data[guildId]) {
    data[guildId][userId] = [];
    writeJSON(FILE, data);
  }
  return [];
}

function removeWarn(guildId, userId, warnId) {
  const { data, warns } = getUserWarns(guildId, userId);
  const idx = warns.findIndex(w => w.id === warnId);
  if (idx === -1) return null;
  const removed = warns.splice(idx, 1)[0];
  writeJSON(FILE, data);
  return removed;
}

module.exports = { addWarn, clearWarns, removeWarn, getUserWarns, getAll };
