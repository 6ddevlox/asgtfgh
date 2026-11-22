const { readJSON, writeJSON } = require('./storage');

const FILE = 'selectRoles.json';

function getPanel(guildId, messageId) {
  const data = readJSON(FILE, {});
  return data[guildId]?.[messageId] || null;
}

function savePanel(guildId, messageId, options) {
  // options: [{ label, roleId, description?, emoji? }]
  const data = readJSON(FILE, {});
  if (!data[guildId]) data[guildId] = {};
  data[guildId][messageId] = { options };
  writeJSON(FILE, data);
}

module.exports = { getPanel, savePanel };
