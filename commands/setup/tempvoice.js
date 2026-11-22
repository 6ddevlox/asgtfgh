const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice')
    .setDescription('Configure temporary voice channels')
    .addChannelOption(opt =>
      opt
        .setName('trigger')
        .setDescription('Join-to-create voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt
        .setName('category')
        .setDescription('Category where temp VCs are created')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName('enabled').setDescription('Enable temp voice').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const trigger = interaction.options.getChannel('trigger');
    const category = interaction.options.getChannel('category');
    const enabled = interaction.options.getBoolean('enabled');

    const configPath = path.join(__dirname, '..', '..', 'config.json');
    if (!config.tempVoice) config.tempVoice = {};
    config.tempVoice.triggerChannelId = trigger.id;
    if (category) config.tempVoice.categoryId = category.id;
    if (enabled !== null) config.tempVoice.enabled = enabled;
    else config.tempVoice.enabled = true;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content:
        `Temp voice configured.\n` +
        `• Trigger: **${trigger.name}**\n` +
        `• Category: ${category ? category.name : 'same as trigger'}\n` +
        `• Enabled: **${config.tempVoice.enabled}**\n\n` +
        `Users who join the trigger channel get their own VC.`,
      ephemeral: true,
    });
  },
};
