const { readJSON, writeJSON } = require('./storage');

const FILE = 'tickets.json';

function getData(guildId) {
  const all = readJSON(FILE, {});
  if (!all[guildId]) all[guildId] = { counter: 0, open: {} };
  return { all, guild: all[guildId] };
}

function nextNumber(guildId) {
  const { all, guild } = getData(guildId);
  guild.counter = (guild.counter || 0) + 1;
  writeJSON(FILE, all);
  return guild.counter;
}

function openTicket(guildId, channelId, userId, number) {
  const { all, guild } = getData(guildId);
  guild.open[channelId] = { userId, number, openedAt: Date.now() };
  writeJSON(FILE, all);
}

function closeTicket(guildId, channelId) {
  const { all, guild } = getData(guildId);
  const info = guild.open[channelId];
  delete guild.open[channelId];
  writeJSON(FILE, all);
  return info;
}

function getTicket(guildId, channelId) {
  const { guild } = getData(guildId);
  return guild.open[channelId] || null;
}

function userHasOpenTicket(guildId, userId) {
  const { guild } = getData(guildId);
  return Object.values(guild.open).find(t => t.userId === userId) || null;
}

module.exports = { nextNumber, openTicket, closeTicket, getTicket, userHasOpenTicket };
