const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setsuggestions')
    .setDescription('Set the channel where /suggest posts')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Suggestions channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('staff').setDescription('Role that can approve/deny').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel');
    const staff = interaction.options.getRole('staff');

    const configPath = path.join(__dirname, '..', '..', 'config.json');
    if (!config.suggestions) config.suggestions = {};
    config.suggestions.channelId = channel.id;
    if (staff) config.suggestions.staffRoleId = staff.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content:
        `Suggestions will post in ${channel}.` +
        (staff ? `\nApprove/deny role: ${staff}` : ''),
      ephemeral: true,
    });
  },
};
