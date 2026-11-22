const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { joinChannel, getVoiceConnection } = require('../../utils/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicejoin')
    .setDescription('Make the bot join a voice channel (for voice mod presence)')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Voice channel to join (default: your current VC)')
        .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction, client, config) {
    let channel = interaction.options.getChannel('channel');

    if (!channel) {
      channel = interaction.member?.voice?.channel;
    }

    if (!channel) {
      return interaction.reply({
        content: 'Join a voice channel first, or specify one with the channel option.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const connection = await joinChannel(channel, config);
    if (!connection) {
      return interaction.editReply('Failed to join that voice channel. Check bot permissions (Connect + Speak).');
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Joined Voice')
      .setDescription(`Now in **${channel.name}** for voice moderation presence.`)
      .setFooter({ text: 'Discord only allows 1 VC per server. Bot follows the most active channel.' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
