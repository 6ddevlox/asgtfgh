const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addWarn, getUserWarns } = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(opt => opt.setName('user').setDescription('Member to warn').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.bot) {
      return interaction.reply({ content: 'You cannot warn bots.', ephemeral: true });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot warn yourself.', ephemeral: true });
    }

    const { warns, entry } = addWarn(
      interaction.guild.id,
      target.id,
      interaction.user.id,
      reason
    );

    const embed = new EmbedBuilder()
      .setColor(0xf59e0b)
      .setTitle('Member Warned')
      .addFields(
        { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Total Warns', value: `${warns.length}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Auto actions
    const wcfg = config.warns || {};
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return;

    if (wcfg.maxWarnsBeforeKick && warns.length >= wcfg.maxWarnsBeforeKick) {
      try {
        await member.kick(`Reached ${warns.length} warns`);
        await interaction.followUp(`**${target.tag}** was kicked for reaching ${warns.length} warns.`);
      } catch (_) {}
    } else if (wcfg.maxWarnsBeforeTimeout && warns.length >= wcfg.maxWarnsBeforeTimeout) {
      const ms = (wcfg.timeoutMinutes || 30) * 60 * 1000;
      try {
        await member.timeout(ms, `Reached ${warns.length} warns`);
        await interaction.followUp(
          `**${target.tag}** was timed out for ${wcfg.timeoutMinutes || 30}m (${warns.length} warns).`
        );
      } catch (_) {}
    }

    try {
      await target.send(
        `You were warned in **${interaction.guild.name}**.\nReason: ${reason}\nTotal warns: ${warns.length}`
      );
    } catch (_) {}

    if (config.logChannelId) {
      const ch = interaction.guild.channels.cache.get(config.logChannelId);
      if (ch?.isTextBased()) {
        await ch.send(`⚠️ **${target.tag}** warned by **${interaction.user.tag}**: ${reason} (${warns.length} total)`).catch(() => {});
      }
    }
  },
};
