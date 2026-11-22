const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { add, remove, list } = require('../../utils/autorespond');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorespond')
    .setDescription('Manage auto-responses (keyword → reply)')
    .addSubcommand(sc =>
      sc
        .setName('add')
        .setDescription('Add a trigger')
        .addStringOption(o => o.setName('trigger').setDescription('Keyword').setRequired(true))
        .addStringOption(o => o.setName('response').setDescription('Reply text').setRequired(true))
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Remove a trigger')
        .addStringOption(o => o.setName('trigger').setDescription('Keyword').setRequired(true))
    )
    .addSubcommand(sc => sc.setName('list').setDescription('List triggers'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;
    if (sub === 'add') {
      const trigger = interaction.options.getString('trigger');
      const response = interaction.options.getString('response');
      add(gid, trigger, response);
      return interaction.reply({ content: `Auto-respond added for \`${trigger}\`.`, ephemeral: true });
    }
    if (sub === 'remove') {
      const trigger = interaction.options.getString('trigger');
      const result = remove(gid, trigger);
      return interaction.reply({
        content: result ? `Removed \`${trigger}\`.` : 'Trigger not found.',
        ephemeral: true,
      });
    }
    const { list: items } = list(gid);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Auto-responses')
      .setDescription(
        items.length
          ? items.map((x, i) => `**${i + 1}.** \`${x.trigger}\` → ${x.response.slice(0, 80)}`).join('\n')
          : 'None set.'
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
