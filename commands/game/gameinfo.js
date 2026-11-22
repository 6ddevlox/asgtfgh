const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gameinfo')
    .setDescription('Information about the VR shooter game'),
  async execute(interaction, client, config) {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${config.gameName} 🐀🔫`)
      .setDescription(
        `A **Gorilla Tag** fan game focused on VR shooting action.\n\n` +
        `Swing through the map, grab weapons, and compete with other players in intense multiplayer matches.`
      )
      .addFields(
        {
          name: '🎮 Features',
          value: '• Gorilla Tag movement system\n• Custom weapons & shooting mechanics\n• Multiplayer lobbies\n• Cosmetics & customization\n• Parkour + combat',
        },
        {
          name: '📌 How to Play',
          value: '1. Download from the official link (when available)\n2. Launch in VR\n3. Join a lobby or create your own\n4. Stay sharp. Stay Ratz.',
        },
        {
          name: '🔗 Links',
          value: '• Discord: This server\n• Updates: Check #announcements\n• Support: Open a ticket or ask staff',
        }
      )
      .setFooter({ text: 'This is a fan game and is not affiliated with Another Axiom.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
