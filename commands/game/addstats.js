const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
    .setName('addstats')
    .setDescription('Add to a player\'s stats (staff only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The player')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('kills')
        .setDescription('Kills to add')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('deaths')
        .setDescription('Deaths to add')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('wins')
        .setDescription('Wins to add')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('games')
        .setDescription('Games to add')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('Points to add')
        .setMinValue(0)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const user = interaction.options.getUser('user');
    const kills = interaction.options.getInteger('kills') || 0;
    const deaths = interaction.options.getInteger('deaths') || 0;
    const wins = interaction.options.getInteger('wins') || 0;
    const games = interaction.options.getInteger('games') || 0;
    const points = interaction.options.getInteger('points') || 0;

    const stats = loadStats();
    if (!stats[user.id]) {
      stats[user.id] = { kills: 0, deaths: 0, wins: 0, games: 0, points: 0 };
    }

    stats[user.id].kills += kills;
    stats[user.id].deaths += deaths;
    stats[user.id].wins += wins;
    stats[user.id].games += games;
    stats[user.id].points += points;

    saveStats(stats);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Stats Added')
      .setDescription(`Added stats for **${user.username}**`)
      .addFields(
        { name: 'Kills', value: `+${kills} → ${stats[user.id].kills}`, inline: true },
        { name: 'Deaths', value: `+${deaths} → ${stats[user.id].deaths}`, inline: true },
        { name: 'Wins', value: `+${wins} → ${stats[user.id].wins}`, inline: true },
        { name: 'Games', value: `+${games} → ${stats[user.id].games}`, inline: true },
        { name: 'Points', value: `+${points} → ${stats[user.id].points}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
