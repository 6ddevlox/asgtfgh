const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { leaderboard } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinleaderboard')
    .setDescription('Top cheese coin balances'),
  async execute(interaction, client, config) {
    const board = leaderboard(interaction.guild.id, 10);
    if (!board.length) {
      return interaction.reply({ content: 'No one has coins yet.', ephemeral: true });
    }
    const lines = await Promise.all(
      board.map(async (e, i) => {
        let name = e.id;
        try { name = (await client.users.fetch(e.id)).username; } catch (_) {}
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        return `${medal} **${name}** — ${e.coins} 🧀`;
      })
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle('🧀 Coin Leaderboard')
          .setDescription(lines.join('\n')),
      ],
    });
  },
};
