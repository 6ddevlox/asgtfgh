const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('howrat')
    .setDescription('How much of a rat is this user?')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Who to rate')
        .setRequired(false)
    ),
  async execute(interaction, client, config) {
    const user = interaction.options.getUser('user') || interaction.user;
    const percent = Math.floor(Math.random() * 101);

    let comment;
    if (percent >= 90) comment = 'Certified sewer legend. Absolute menace.';
    else if (percent >= 70) comment = 'Strong rat energy. Respect.';
    else if (percent >= 50) comment = 'Halfway to full rat. Keep training.';
    else if (percent >= 30) comment = 'More mouse than rat... for now.';
    else comment = 'Barely a rat. Go touch some cheese.';

    const barLength = 10;
    const filled = Math.round((percent / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🐀 Rat Rating')
      .setDescription(`**${user.username}** is **${percent}%** rat\n\n\`${bar}\` ${percent}%\n\n*${comment}*`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Scientific results may vary' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
