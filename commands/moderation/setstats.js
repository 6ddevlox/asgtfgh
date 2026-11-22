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
    .setName('setstats')
    .setDescription('Set a player\'s stats (staff only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The player')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('kills')
        .setDescription('Number of kills')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('deaths')
        .setDescription('Number of deaths')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('wins')
        .setDescription('Number of wins')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('games')
        .setDescription('Number of games played')
        .setMinValue(0)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('Total points')
        .setMinValue(0)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const user = interaction.options.getUser('user');
    const kills = interaction.options.getInteger('kills');
    const deaths = interaction.options.getInteger('deaths');
    const wins = interaction.options.getInteger('wins');
    const games = interaction.options.getInteger('games');
    const points = interaction.options.getInteger('points');

    const stats = loadStats();
    if (!stats[user.id]) {
      stats[user.id] = { kills: 0, deaths: 0, wins: 0, games: 0, points: 0 };
    }

    if (kills !== null) stats[user.id].kills = kills;
    if (deaths !== null) stats[user.id].deaths = deaths;
    if (wins !== null) stats[user.id].wins = wins;
    if (games !== null) stats[user.id].games = games;
    if (points !== null) stats[user.id].points = points;

    saveStats(stats);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Stats Updated')
      .setDescription(`Updated stats for **${user.username}**`)
      .addFields(
        { name: 'Kills', value: `${stats[user.id].kills}`, inline: true },
        { name: 'Deaths', value: `${stats[user.id].deaths}`, inline: true },
        { name: 'Wins', value: `${stats[user.id].wins}`, inline: true },
        { name: 'Games', value: `${stats[user.id].games}`, inline: true },
        { name: 'Points', value: `${stats[user.id].points}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
