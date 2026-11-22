const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const statsPath = path.join(__dirname, '../../data/stats.json');

function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top players')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('What to rank by')
        .setRequired(false)
        .addChoices(
          { name: 'Points', value: 'points' },
          { name: 'Kills', value: 'kills' },
          { name: 'Wins', value: 'wins' },
          { name: 'K/D Ratio', value: 'kd' }
        )
    ),
  async execute(interaction, client, config) {
    const type = interaction.options.getString('type') || 'points';
    const stats = loadStats();

    let sorted = Object.entries(stats).map(([id, data]) => {
      const kd = data.deaths === 0 ? data.kills : data.kills / data.deaths;
      return {
        id,
        ...data,
        kd: Number(kd.toFixed(2)),
      };
    });

    if (type === 'kd') {
      sorted.sort((a, b) => b.kd - a.kd);
    } else {
      sorted.sort((a, b) => (b[type] || 0) - (a[type] || 0));
    }

    sorted = sorted.slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({
        content: 'No stats recorded yet. Staff can use `/setstats` to add players.',
        ephemeral: true,
      });
    }

    const medals = ['🥇', '🥈', '🥉'];
    let description = '';

    for (let i = 0; i < sorted.length; i++) {
      const player = sorted[i];
      const medal = medals[i] || `**${i + 1}.**`;
      let value;

      if (type === 'kd') value = player.kd;
      else value = player[type] || 0;

      description += `${medal} <@${player.id}> — **${value}** ${type === 'kd' ? 'K/D' : type}\n`;
    }

    const titles = {
      points: '⭐ Points Leaderboard',
      kills: '🔫 Kills Leaderboard',
      wins: '🏆 Wins Leaderboard',
      kd: '📊 K/D Leaderboard',
    };

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(titles[type] || 'Leaderboard')
      .setDescription(description)
      .setFooter({ text: 'Top 10 players' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
