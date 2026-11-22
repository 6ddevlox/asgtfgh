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
    .setName('lfgpanel')
    .setDescription('Post a Looking-For-Group button panel')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to post in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Looking For Group')
      .setDescription(
        'Click a button to ping that you want to play.\n' +
          'Be ready to share a lobby code after.'
      )
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('lfg_duo')
        .setLabel('Duo')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId('lfg_squad')
        .setLabel('Squad')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🦍'),
      new ButtonBuilder()
        .setCustomId('lfg_fill')
        .setLabel('Fill / Any')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎯')
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `LFG panel posted in ${channel}.`, ephemeral: true });
  },
};
