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
    .setName('staffapp')
    .setDescription('Post a staff application panel')
    .addChannelOption(opt =>
      opt
        .setName('review_channel')
        .setDescription('Private channel where applications are sent')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt
        .setName('panel_channel')
        .setDescription('Channel to post the Apply button')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const review = interaction.options.getChannel('review_channel');
    const panelChannel = interaction.options.getChannel('panel_channel') || interaction.channel;

    const configPath = path.join(__dirname, '..', '..', 'config.json');
    config.staffAppChannelId = review.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Staff Applications')
      .setDescription(
        `Want to help moderate **${config.gameName}**?\n\n` +
          `Click **Apply** and fill out the form. Staff will review it privately.`
      )
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('staff_apply')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝')
    );

    await panelChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({
      content: `Staff app panel posted in ${panelChannel}. Reviews go to ${review}.`,
      ephemeral: true,
    });
  },
};
