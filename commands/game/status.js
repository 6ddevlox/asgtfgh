const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check game / server status (placeholder)'),
  async execute(interaction, client, config) {
    // This is a placeholder. Later you can connect this to your actual game servers
    // (PlayFab, Photon, custom backend, etc.)

    const embed = new EmbedBuilder()
      .setColor(0x22c55e) // green
      .setTitle('🟢 Server Status')
      .setDescription(`**${config.gameName}** status`)
      .addFields(
        { name: 'Game Status', value: 'Online', inline: true },
        { name: 'Multiplayer', value: 'Operational', inline: true },
        { name: 'Last Update', value: 'Recently', inline: true },
        {
          name: 'Note',
          value: 'This is currently a static status. Connect this command to your real backend (PlayFab / Photon / custom API) when ready for live player counts and lobby info.',
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
