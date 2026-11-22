const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { clearWarns } = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const target = interaction.options.getUser('user');
    clearWarns(interaction.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle('Warnings Cleared')
      .setDescription(`Cleared all warnings for **${target.tag}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
