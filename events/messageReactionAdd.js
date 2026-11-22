const { Events } = require('discord.js');
const { readJSON } = require('../utils/storage');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user, client, config) {
    if (user.bot) return;

    // Fetch partials
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

    const role = guild.roles.cache.get(roleId);
    if (!role) return;

    if (member.roles.cache.has(roleId)) return;

    try {
      await member.roles.add(role, 'Reaction role');
    } catch (err) {
      console.error('Failed to add reaction role:', err.message);
    }

    // Starboard (runs after reaction roles attempt)
  },
};

// Separate starboard handler attached below via monkey-patch of execute
const originalExecute = module.exports.execute;
module.exports.execute = async function(reaction, user, client, config) {
  await originalExecute(reaction, user, client, config);
  try {
    await handleStarboard(reaction, user, client, config);
  } catch (e) {
    console.error('Starboard error:', e.message);
  }
};

async function handleStarboard(reaction, user, client, config) {
  if (user.bot) return;
  if (!config.starboardChannelId) return;
  const emoji = reaction.emoji.name;
  if (emoji !== '⭐' && emoji !== '🌟') return;

  if (reaction.partial) await reaction.fetch().catch(() => null);
  if (reaction.message.partial) await reaction.message.fetch().catch(() => null);

  const msg = reaction.message;
  if (!msg.guild || msg.author?.bot) return;
  if (msg.channel.id === config.starboardChannelId) return;

  const count = reaction.count || 0;
  const min = config.starboardMinStars || 3;
  if (count < min) return;

  const { getPosted, setPosted } = require('../utils/starboard');
  if (getPosted(msg.guild.id, msg.id)) return;

  const starChannel = msg.guild.channels.cache.get(config.starboardChannelId);
  if (!starChannel?.isTextBased()) return;

  const { EmbedBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(0xfbbf24)
    .setAuthor({
      name: msg.author?.tag || 'Unknown',
      iconURL: msg.author?.displayAvatarURL?.({ dynamic: true }),
    })
    .setDescription(msg.content || '*No text*')
    .addFields({ name: 'Source', value: `[Jump to message](${msg.url})` })
    .setFooter({ text: `⭐ ${count}` })
    .setTimestamp(msg.createdAt);

  if (msg.attachments?.size) {
    const img = msg.attachments.find(a => a.contentType?.startsWith('image/'));
    if (img) embed.setImage(img.url);
  }

  const posted = await starChannel.send({ embeds: [embed] });
  setPosted(msg.guild.id, msg.id, posted.id);
}
