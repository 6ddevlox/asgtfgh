const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set the channel for mod / anti-raid / auto-mod logs')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Log channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel');
    const configPath = path.join(__dirname, '..', '..', 'config.json');

    config.logChannelId = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Log Channel Updated')
      .setDescription(`Moderation & protection logs will go to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
