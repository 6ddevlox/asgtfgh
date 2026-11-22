const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getVoiceConnection } = require('../../utils/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voiceleave')
    .setDescription('Make the bot leave its current voice channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction, client, config) {
    const connection = getVoiceConnection(interaction.guild.id);

    if (!connection) {
      return interaction.reply({
        content: 'I am not in a voice channel right now.',
        ephemeral: true,
      });
    }

    try {
      connection.destroy();
    } catch (_) {}

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Left Voice')
      .setDescription('Disconnected from voice.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
