const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addPhrase, removePhrase, getList } = require('../../utils/blacklist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage the live phrase blacklist (no restart needed)')
    .addSubcommand(sc =>
      sc
        .setName('add')
        .setDescription('Add a banned phrase')
        .addStringOption(o =>
          o.setName('phrase').setDescription('Phrase to block').setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Remove a phrase')
        .addStringOption(o =>
          o.setName('phrase').setDescription('Phrase to remove').setRequired(true)
        )
    )
    .addSubcommand(sc => sc.setName('list').setDescription('Show blacklisted phrases'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'add') {
      const phrase = interaction.options.getString('phrase');
      const { added, list } = addPhrase(guildId, phrase);
      return interaction.reply({
        content: added
          ? `Added \`${phrase}\` to the blacklist. (${list.length} total)`
          : `\`${phrase}\` is already blacklisted.`,
        ephemeral: true,
      });
    }

    if (sub === 'remove') {
      const phrase = interaction.options.getString('phrase');
      const { removed, list } = removePhrase(guildId, phrase);
      return interaction.reply({
        content: removed
          ? `Removed \`${phrase}\` from the blacklist. (${list.length} left)`
          : `\`${phrase}\` was not on the blacklist.`,
        ephemeral: true,
      });
    }

    // list
    const { list } = getList(guildId);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Phrase Blacklist')
      .setDescription(
        list.length
          ? list.map((p, i) => `**${i + 1}.** \`${p}\``).join('\n')
          : 'No phrases blacklisted yet.'
      )
      .setFooter({ text: 'Messages containing these are auto-deleted' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
