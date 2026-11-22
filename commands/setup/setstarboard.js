const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstarboard')
    .setDescription('Set starboard channel')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Starboard channel').addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('min_stars').setDescription('Minimum stars (default 3)').setMinValue(1).setMaxValue(20).setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel');
    const min = interaction.options.getInteger('min_stars') || 3;
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    config.starboardChannelId = channel.id;
    config.starboardMinStars = min;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({
      content: `Starboard → ${channel} (min **${min}** ⭐)`,
      ephemeral: true,
    });
  },
};
