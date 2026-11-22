const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Post a ticket panel with an Open Ticket button')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to post the panel in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('title').setDescription('Panel title').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('description').setDescription('Panel description').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const title = interaction.options.getString('title') || 'Support Tickets';
    const description =
      interaction.options.getString('description') ||
      'Need help, want to report someone, or have a question?\nClick the button below to open a private ticket with staff.';

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: 'RATZ BOT • Tickets' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `Ticket panel posted in ${channel}.`, ephemeral: true });
  },
};
