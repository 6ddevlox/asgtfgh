const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setautorole')
    .setDescription('Set the role given automatically on join (when verification is off)')
    .addRoleOption(opt =>
      opt.setName('role').setDescription('Auto role').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const role = interaction.options.getRole('role');
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    config.memberRoleId = role.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `Auto-role set to ${role}. New members will receive it on join (if verification is disabled).`,
      ephemeral: true,
    });
  },
};
