const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setUserLevel } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a member\'s level (Staff)')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName('level')
        .setDescription('Level to set (1-200)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(200)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client, config) {
    const target = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    const user = setUserLevel(interaction.guild.id, target.id, level);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Level Updated')
      .setDescription(`Set **${target.username}** to **Level ${user.level}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
