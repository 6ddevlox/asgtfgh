const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levelrole')
    .setDescription('Assign a role when users reach a level')
    .addSubcommand(sc =>
      sc
        .setName('set')
        .setDescription('Set level → role')
        .addIntegerOption(o => o.setName('level').setRequired(true).setMinValue(1).setMaxValue(200).setDescription('Level'))
        .addRoleOption(o => o.setName('role').setRequired(true).setDescription('Role'))
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Remove a level role')
        .addIntegerOption(o => o.setName('level').setRequired(true).setMinValue(1).setMaxValue(200).setDescription('Level'))
    )
    .addSubcommand(sc => sc.setName('list').setDescription('List level roles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '..', '..', 'config.json');
    if (!config.levelRoles) config.levelRoles = {};

    if (sub === 'set') {
      const level = String(interaction.options.getInteger('level'));
      const role = interaction.options.getRole('role');
      config.levelRoles[level] = role.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return interaction.reply({ content: `Level **${level}** → ${role}`, ephemeral: true });
    }
    if (sub === 'remove') {
      const level = String(interaction.options.getInteger('level'));
      delete config.levelRoles[level];
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return interaction.reply({ content: `Removed level **${level}** role reward.`, ephemeral: true });
    }
    const entries = Object.entries(config.levelRoles || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
    const desc = entries.length
      ? entries.map(([l, r]) => `Level **${l}** → <@&${r}>`).join('\n')
      : 'None set.';
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.embedColor).setTitle('Level Roles').setDescription(desc)],
      ephemeral: true,
    });
  },
};
