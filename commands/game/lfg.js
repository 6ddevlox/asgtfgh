const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lfg')
    .setDescription('Looking for group / teammates')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('What are you looking for? (e.g. "Need 2 for ranked")')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Your platform')
        .setRequired(false)
        .addChoices(
          { name: 'Quest', value: 'Quest' },
          { name: 'PCVR', value: 'PCVR' },
          { name: 'Any', value: 'Any' }
        )
    ),
  async execute(interaction, client, config) {
    const message = interaction.options.getString('message');
    const platform = interaction.options.getString('platform') || 'Any';

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({
        name: `${interaction.user.username} is looking for group`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(message)
      .addFields(
        { name: 'Platform', value: platform, inline: true },
        { name: 'User', value: `<@${interaction.user.id}>`, inline: true }
      )
      .setFooter({ text: 'React or reply if you want to join!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
