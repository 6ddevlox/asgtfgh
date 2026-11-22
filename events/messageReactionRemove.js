const { Events } = require('discord.js');
const { readJSON } = require('../utils/storage');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user, client, config) {
    if (user.bot) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch {
        return;
      }
    }
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch {
        return;
      }
    }

    const data = readJSON('reactionRoles.json', {});
    const guildId = reaction.message.guildId;
    const messageId = reaction.message.id;
    const guildData = data[guildId];
    if (!guildData || !guildData[messageId]) return;

    const emojiKey = reaction.emoji.id
      ? `id:${reaction.emoji.id}`
      : `name:${reaction.emoji.name}`;

    const roleId = guildData[messageId][emojiKey];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    if (!member.roles.cache.has(roleId)) return;

    try {
      await member.roles.remove(roleId, 'Reaction role removed');
    } catch (err) {
      console.error('Failed to remove reaction role:', err.message);
    }
  },
};
