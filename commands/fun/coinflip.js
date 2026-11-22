const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),
  async execute(interaction, client, config) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`🪙 **${result}**`),
      ],
    });
  },
};
