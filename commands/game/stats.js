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

function saveStats(stats) {
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View player stats')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check stats for (defaults to you)')
        .setRequired(false)
    ),
  async execute(interaction, client, config) {
    const user = interaction.options.getUser('user') || interaction.user;
    const stats = loadStats();
    const userStats = stats[user.id] || {
      kills: 0,
      deaths: 0,
      wins: 0,
      games: 0,
      points: 0,
    };

    const kd = userStats.deaths === 0
      ? userStats.kills.toFixed(2)
      : (userStats.kills / userStats.deaths).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({
        name: `${user.username}'s Stats`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: '🔫 Kills', value: `${userStats.kills}`, inline: true },
        { name: '💀 Deaths', value: `${userStats.deaths}`, inline: true },
        { name: '📊 K/D', value: `${kd}`, inline: true },
        { name: '🏆 Wins', value: `${userStats.wins}`, inline: true },
        { name: '🎮 Games', value: `${userStats.games}`, inline: true },
        { name: '⭐ Points', value: `${userStats.points}`, inline: true }
      )
      .setFooter({ text: 'Stats are manually tracked for now. Connect to your game backend later.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

// Export helpers so other commands can use them
module.exports.loadStats = loadStats;
module.exports.saveStats = saveStats;
