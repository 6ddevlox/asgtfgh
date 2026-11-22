const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLockdown, isLocked } = require('../../utils/antiraid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Manually enable or check anti-raid lockdown')
    .addIntegerOption(opt =>
      opt
        .setName('minutes')
        .setDescription('How long to lock (0 = check status only)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(120)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const minutes = interaction.options.getInteger('minutes');

    if (minutes === null || minutes === 0) {
      const locked = isLocked(interaction.guild.id);
      return interaction.reply({
        content: locked
          ? '🔒 Server is currently in anti-raid lockdown.'
          : '🔓 Server is not in lockdown.',
        ephemeral: true,
      });
    }

    setLockdown(interaction.guild.id, minutes);

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle('Anti-Raid Lockdown Enabled')
      .setDescription(
        `New joins will be kicked for the next **${minutes}** minutes.`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    if (config.logChannelId) {
      const ch = interaction.guild.channels.cache.get(config.logChannelId);
      if (ch?.isTextBased()) {
        await ch
          .send(
            `🔒 Manual lockdown by **${interaction.user.tag}** for ${minutes} min.`
          )
          .catch(() => {});
      }
    }
  },
};
