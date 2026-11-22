const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, levelFromTotalXp } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your level and XP (or another member)')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member to check').setRequired(false)
    ),
  async execute(interaction, client, config) {
    const target = interaction.options.getUser('user') || interaction.user;
    const { user } = getUser(interaction.guild.id, target.id);
    const progress = levelFromTotalXp(user.xp || 0);

    const barLen = 12;
    const filled = Math.round((progress.currentXp / progress.needed) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Level', value: `**${progress.level}**`, inline: true },
        { name: 'Total XP', value: `${user.xp || 0}`, inline: true },
        {
          name: 'Progress',
          value: `\`${bar}\` ${progress.currentXp} / ${progress.needed} XP`,
        }
      )
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
