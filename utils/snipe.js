// In-memory last deleted message per channel
const snipes = new Map(); // channelId -> { content, authorTag, authorAvatar, attachments, at }

function set(channelId, data) {
  snipes.set(channelId, { ...data, at: Date.now() });
}

function get(channelId) {
  const s = snipes.get(channelId);
  if (!s) return null;
  // expire after 2 minutes
  if (Date.now() - s.at > 2 * 60 * 1000) {
    snipes.delete(channelId);
    return null;
  }
  return s;
}

module.exports = { set, get };
