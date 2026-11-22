const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getTicket, closeTicket } = require('../../utils/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the current support ticket')
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for closing').setRequired(false)
    ),
  async execute(interaction, client, config) {
    const ticket = getTicket(interaction.guild.id, interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        content: 'This channel is not an open ticket.',
        ephemeral: true,
      });
    }

    const isStaff =
      interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels) ||
      (config.ticketSupportRoleId &&
        interaction.member.roles.cache.has(config.ticketSupportRoleId));

    if (ticket.userId !== interaction.user.id && !isStaff) {
      return interaction.reply({
        content: 'Only the ticket owner or staff can close this.',
        ephemeral: true,
      });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';
    closeTicket(interaction.guild.id, interaction.channel.id);

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle('Ticket Closed')
      .setDescription(`Closed by **${interaction.user.tag}**\nReason: ${reason}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(async () => {
      try {
        await interaction.channel.delete('Ticket closed');
      } catch (_) {}
    }, 4000);
  },
};
