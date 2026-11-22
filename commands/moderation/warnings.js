const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserWarns } = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a member')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Member').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const target = interaction.options.getUser('user');
    const { warns } = getUserWarns(interaction.guild.id, target.id);

    if (!warns.length) {
      return interaction.reply({
        content: `**${target.tag}** has no warnings.`,
        ephemeral: true,
      });
    }

    const lines = warns
      .slice(-15)
      .map(
        (w, i) =>
          `**${i + 1}.** ${w.reason}\n by <@${w.moderatorId}> • <t:${Math.floor(w.at / 1000)}:R> • \`${w.id}\``
      )
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`Warnings — ${target.tag}`)
      .setDescription(lines)
      .setFooter({ text: `Total: ${warns.length}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
