const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a player or issue')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Why are you reporting?')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The Discord user you are reporting (optional)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('ingame')
        .setDescription('In-game name / player ID (optional)')
        .setRequired(false)
    ),
  async execute(interaction, client, config) {
    const reason = interaction.options.getString('reason');
    const reportedUser = interaction.options.getUser('user');
    const ingame = interaction.options.getString('ingame');

    // Look for a reports / mod-logs channel
    const reportChannel = interaction.guild.channels.cache.find(
      ch =>
        (ch.name.includes('report') || ch.name.includes('mod-log') || ch.name.includes('modlog')) &&
        ch.isTextBased()
    );

    const embed = new EmbedBuilder()
      .setColor(0xEF4444)
      .setTitle('New Report')
      .addFields(
        { name: 'Reporter', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: false },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    if (reportedUser) {
      embed.addFields({ name: 'Reported Discord User', value: `${reportedUser.tag} (<@${reportedUser.id}>)` });
    }
    if (ingame) {
      embed.addFields({ name: 'In-Game Name / ID', value: ingame });
    }

    if (reportChannel) {
      await reportChannel.send({ embeds: [embed] });
      await interaction.reply({
        content: 'Your report has been sent to the staff team. Thank you.',
        ephemeral: true,
      });
    } else {
      // Fallback: send as ephemeral confirmation + post in current channel (not ideal)
      await interaction.reply({
        content: 'No report channel found. Please contact staff directly.\n\nYour report details:',
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
