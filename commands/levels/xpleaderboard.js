const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xpleaderboard')
    .setDescription('Top members by level / XP'),
  async execute(interaction, client, config) {
    const board = getLeaderboard(interaction.guild.id, 10);

    if (!board.length) {
      return interaction.reply({
        content: 'No one has earned XP yet. Start chatting!',
        ephemeral: true,
      });
    }

    const lines = await Promise.all(
      board.map(async (entry, i) => {
        let name = entry.id;
        try {
          const u = await interaction.client.users.fetch(entry.id);
          name = u.username;
        } catch (_) {}
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        return `${medal} **${name}** — Level ${entry.level} (${entry.xp} XP)`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📈 XP Leaderboard')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
