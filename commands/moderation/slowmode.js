const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode quickly')
    .addStringOption(opt =>
      opt
        .setName('duration')
        .setDescription('Slowmode duration')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: '0' },
          { name: '5 seconds', value: '5' },
          { name: '10 seconds', value: '10' },
          { name: '15 seconds', value: '15' },
          { name: '30 seconds', value: '30' },
          { name: '1 minute', value: '60' },
          { name: '5 minutes', value: '300' },
          { name: '1 hour', value: '3600' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction, client, config) {
    const seconds = parseInt(interaction.options.getString('duration'), 10);
    try {
      await interaction.channel.setRateLimitPerUser(seconds, `Slowmode by ${interaction.user.tag}`);
      await interaction.reply({
        content:
          seconds === 0
            ? 'Slowmode disabled.'
            : `Slowmode set to **${seconds}s**.`,
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        content: `Failed: ${err.message}`,
        ephemeral: true,
      });
    }
  },
};
