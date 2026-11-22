const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelmode')
    .setDescription('Restrict a channel to images, links, or media only')
    .addStringOption(o =>
      o
        .setName('mode')
        .setDescription('Mode')
        .setRequired(true)
        .addChoices(
          { name: 'off', value: 'off' },
          { name: 'image-only', value: 'image' },
          { name: 'link-only', value: 'link' },
          { name: 'media-only (image or video)', value: 'media' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction, client, config) {
    const mode = interaction.options.getString('mode');
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    if (!config.channelModes) config.channelModes = {};
    if (mode === 'off') {
      delete config.channelModes[interaction.channel.id];
    } else {
      config.channelModes[interaction.channel.id] = mode;
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({
      content: mode === 'off' ? 'Channel mode cleared.' : `Channel set to **${mode}** only.`,
      ephemeral: true,
    });
  },
};
