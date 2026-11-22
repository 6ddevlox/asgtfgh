const { readJSON, writeJSON } = require('./storage');

const FILE = 'sticky.json';

function getSticky(guildId, channelId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[channelId] || null;
}

function setSticky(guildId, channelId, content, lastMessageId = null) {
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = { content, lastMessageId };
  writeJSON(FILE, data);
}

function clearSticky(guildId, channelId) {
  const data = readJSON(FILE, {});
  if (data[guildId]) {
    delete data[guildId][channelId];
    writeJSON(FILE, data);
  }
}

function updateLastId(guildId, channelId, messageId) {
  const data = readJSON(FILE, {});
  if (data[guildId]?.[channelId]) {
    data[guildId][channelId].lastMessageId = messageId;
    writeJSON(FILE, data);
  }
}

module.exports = { getSticky, setSticky, clearSticky, updateLastId };
