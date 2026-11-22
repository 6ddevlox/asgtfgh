const { readJSON, writeJSON } = require('./storage');
const FILE = 'starboard.json';

function getPosted(guildId, messageId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[messageId] || null;
}

function setPosted(guildId, messageId, starMessageId) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  data[guildId][messageId] = starMessageId;
  writeJSON(FILE, data);
}

module.exports = { getPosted, setPosted };
