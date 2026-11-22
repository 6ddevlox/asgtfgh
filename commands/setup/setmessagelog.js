const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmessagelog')
    .setDescription('Set the channel for deleted/edited message logs')
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
    config.messageLogChannelId = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({
      content: `Message logs will go to ${channel}.`,
      ephemeral: true,
    });
  },
};
