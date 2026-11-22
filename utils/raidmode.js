const { PermissionFlagsBits } = require('discord.js');
const { readJSON, writeJSON } = require('./storage');

const FILE = 'raidmode.json';

function isActive(guildId) {
  const data = readJSON(FILE, {});
  return !!data[guildId]?.active;
}

function setActive(guildId, active) {
  const data = readJSON(FILE, {});
  data[guildId] = { active: !!active, at: Date.now() };
  writeJSON(FILE, data);
}

/**
 * Lock or unlock @everyone send messages in text channels.
 * Saves previous overwrites so we can restore.
 */
async function applyLock(guild, lock) {
  const everyone = guild.roles.everyone;
  const results = { changed: 0, failed: 0 };

  for (const channel of guild.channels.cache.values()) {
    if (!channel.isTextBased?.() || channel.isThread?.()) continue;
    if (channel.isVoiceBased?.()) continue;

    try {
      if (lock) {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: false,
          AddReactions: false,
        });
      } else {
        // Reset to null (inherit) for these perms
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: null,
          AddReactions: null,
        });
      }
      results.changed++;
    } catch {
      results.failed++;
    }
  }

  setActive(guild.id, lock);
  return results;
}

module.exports = { isActive, setActive, applyLock };
