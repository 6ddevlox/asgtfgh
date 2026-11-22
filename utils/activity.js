const { readJSON, writeJSON } = require('./storage');

const FILE = 'activity.json';

function getData(guildId) {
  const all = readJSON(FILE, {});
  if (!all[guildId]) {
    all[guildId] = {
      messages: 0,
      joins: 0,
      leaves: 0,
      day: new Date().toISOString().slice(0, 10),
      topChatters: {},
    };
  }
  // Reset daily counters if day changed
  const today = new Date().toISOString().slice(0, 10);
  if (all[guildId].day !== today) {
    all[guildId] = {
      messages: 0,
      joins: 0,
      leaves: 0,
      day: today,
      topChatters: {},
      prev: {
        messages: all[guildId].messages,
        joins: all[guildId].joins,
        leaves: all[guildId].leaves,
      },
    };
  }
  return { all, guild: all[guildId] };
}

function trackMessage(guildId, userId) {
  const { all, guild } = getData(guildId);
  guild.messages++;
  guild.topChatters[userId] = (guild.topChatters[userId] || 0) + 1;
  writeJSON(FILE, all);
}

function trackJoin(guildId) {
  const { all, guild } = getData(guildId);
  guild.joins++;
  writeJSON(FILE, all);
}

function trackLeave(guildId) {
  const { all, guild } = getData(guildId);
  guild.leaves++;
  writeJSON(FILE, all);
}

function getStats(guildId) {
  const { guild } = getData(guildId);
  const top = Object.entries(guild.topChatters || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));
  return {
    messages: guild.messages || 0,
    joins: guild.joins || 0,
    leaves: guild.leaves || 0,
    day: guild.day,
    topChatters: top,
    prev: guild.prev || null,
  };
}

module.exports = { trackMessage, trackJoin, trackLeave, getStats };
