const { readJSON, writeJSON } = require('./storage');

const FILE = 'suggestions.json';

function getAll(guildId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  return { data, guild: data[guildId] };
}

function addSuggestion(guildId, messageId, userId, text) {
  const { data, guild } = getAll(guildId);
  guild[messageId] = {
    userId,
    text,
    status: 'pending',
    up: 0,
    down: 0,
    at: Date.now(),
  };
  writeJSON(FILE, data);
}

function setStatus(guildId, messageId, status) {
  const { data, guild } = getAll(guildId);
  if (guild[messageId]) {
    guild[messageId].status = status;
    writeJSON(FILE, data);
    return guild[messageId];
  }
  return null;
}

function getSuggestion(guildId, messageId) {
  const { guild } = getAll(guildId);
  return guild[messageId] || null;
}

module.exports = { addSuggestion, setStatus, getSuggestion };
