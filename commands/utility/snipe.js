const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get } = require('../../utils/snipe');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Show the last deleted message in this channel'),
  async execute(interaction, client, config) {
    const s = get(interaction.channel.id);
    if (!s) {
      return interaction.reply({ content: 'Nothing to snipe.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({ name: s.authorTag, iconURL: s.authorAvatar || undefined })
      .setDescription(s.content || '*empty*')
      .setFooter({ text: 'Deleted message' })
      .setTimestamp(s.at);
    if (s.attachments?.length) {
      embed.addFields({ name: 'Attachments', value: s.attachments.join('\n').slice(0, 1024) });
    }
    await interaction.reply({ embeds: [embed] });
  },
};
