const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('appealpanel')
    .setDescription('Post a ban appeal ticket panel')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to post the panel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0xf59e0b)
      .setTitle('Ban Appeals')
      .setDescription(
        'Think your ban was a mistake or want to appeal?\n\n' +
          'Click the button below to open a **private appeal ticket** with staff.\n' +
          'Be honest and clear — spam appeals may be ignored.'
      )
      .setFooter({ text: 'RATZ Appeals' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_appeal')
        .setLabel('Open Appeal')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚖️')
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({
      content: `Appeal panel posted in ${channel}.`,
      ephemeral: true,
    });
  },
};
