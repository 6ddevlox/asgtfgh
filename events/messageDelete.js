const { Events, EmbedBuilder } = require('discord.js');
const snipe = require('../utils/snipe');

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client, config) {
    if (!config.messageLogChannelId) return;
    if (!message.guild) return;
    if (message.author?.bot) return;

    
    // Snipe cache
    if (!message.partial && message.author && !message.author.bot) {
      snipe.set(message.channel.id, {
        content: message.content || '',
        authorTag: message.author.tag,
        authorAvatar: message.author.displayAvatarURL({ dynamic: true }),
        attachments: message.attachments?.size
          ? [...message.attachments.values()].map(a => a.url)
          : [],
      });
    }

    const log = message.guild.channels.cache.get(config.messageLogChannelId);
    if (!log?.isTextBased()) return;

    const content = message.partial
      ? '*Content unavailable (uncached message)*'
      : message.content || '*No text content*';

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle('Message Deleted')
      .addFields(
        {
          name: 'Author',
          value: message.author
            ? `${message.author.tag} (${message.author.id})`
            : 'Unknown',
          inline: true,
        },
        {
          name: 'Channel',
          value: message.channel ? `${message.channel}` : 'Unknown',
          inline: true,
        },
        { name: 'Content', value: content.slice(0, 1024) || '*empty*' }
      )
      .setTimestamp(message.createdAt || new Date());

    if (message.attachments?.size) {
      embed.addFields({
        name: 'Attachments',
        value: [...message.attachments.values()]
          .map(a => a.url)
          .join('\n')
          .slice(0, 1024),
      });
    }

    await log.send({ embeds: [embed] }).catch(() => {});
  },
};
