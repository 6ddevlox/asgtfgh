const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setticketcategory')
    .setDescription('Set the category where ticket channels are created')
    .addChannelOption(opt =>
      opt
        .setName('category')
        .setDescription('Category for tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt
        .setName('support')
        .setDescription('Role that can see and manage tickets')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const category = interaction.options.getChannel('category');
    const support = interaction.options.getRole('support');

    const configPath = path.join(__dirname, '..', '..', 'config.json');
    config.ticketCategoryId = category.id;
    if (support) config.ticketSupportRoleId = support.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content:
        `Ticket category set to **${category.name}**.` +
        (support ? `\nSupport role: ${support}` : ''),
      ephemeral: true,
    });
  },
};
