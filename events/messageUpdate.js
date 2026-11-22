const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client, config) {
    if (!config.messageLogChannelId) return;
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const log = newMessage.guild.channels.cache.get(config.messageLogChannelId);
    if (!log?.isTextBased()) return;

    const before = oldMessage.partial
      ? '*Unavailable*'
      : oldMessage.content || '*empty*';
    const after = newMessage.content || '*empty*';

    const embed = new EmbedBuilder()
      .setColor(0xf59e0b)
      .setTitle('Message Edited')
      .addFields(
        {
          name: 'Author',
          value: newMessage.author
            ? `${newMessage.author.tag} (${newMessage.author.id})`
            : 'Unknown',
          inline: true,
        },
        {
          name: 'Channel',
          value: `${newMessage.channel}`,
          inline: true,
        },
        { name: 'Before', value: before.slice(0, 1024) },
        { name: 'After', value: after.slice(0, 1024) }
      )
      .setTimestamp();

    if (newMessage.url) {
      embed.setURL(newMessage.url);
    }

    await log.send({ embeds: [embed] }).catch(() => {});
  },
};
