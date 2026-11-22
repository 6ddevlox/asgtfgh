const { readJSON, writeJSON } = require('./storage');

const FILE = 'tempVoice.json';
// In-memory map of channelId -> ownerId for quick cleanup
const active = new Map(); // channelId -> { guildId, ownerId }

function track(channelId, guildId, ownerId) {
  active.set(channelId, { guildId, ownerId });
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = { ownerId, createdAt: Date.now() };
  writeJSON(FILE, data);
}

function untrack(channelId) {
  const info = active.get(channelId);
  active.delete(channelId);
  if (info) {
    const data = readJSON(FILE, {});
    if (data[info.guildId]) {
      delete data[info.guildId][channelId];
      writeJSON(FILE, data);
    }
  }
  return info;
}

function isTemp(channelId) {
  return active.has(channelId);
}

function getOwner(channelId) {
  return active.get(channelId)?.ownerId || null;
}

function loadFromDisk() {
  const data = readJSON(FILE, {});
  for (const [guildId, channels] of Object.entries(data)) {
    for (const [channelId, info] of Object.entries(channels || {})) {
      active.set(channelId, { guildId, ownerId: info.ownerId });
    }
  }
}

module.exports = { track, untrack, isTemp, getOwner, loadFromDisk };
