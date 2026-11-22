const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { add, get, clear } = require('../../utils/notes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Staff notes on a member')
    .addSubcommand(sc =>
      sc
        .setName('add')
        .setDescription('Add a note')
        .addUserOption(o => o.setName('user').setRequired(true).setDescription('User'))
        .addStringOption(o => o.setName('text').setRequired(true).setDescription('Note'))
    )
    .addSubcommand(sc =>
      sc
        .setName('list')
        .setDescription('List notes')
        .addUserOption(o => o.setName('user').setRequired(true).setDescription('User'))
    )
    .addSubcommand(sc =>
      sc
        .setName('clear')
        .setDescription('Clear notes')
        .addUserOption(o => o.setName('user').setRequired(true).setDescription('User'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    if (sub === 'add') {
      const text = interaction.options.getString('text');
      add(interaction.guild.id, user.id, interaction.user.id, text);
      return interaction.reply({ content: `Note added on **${user.tag}**.`, ephemeral: true });
    }
    if (sub === 'clear') {
      clear(interaction.guild.id, user.id);
      return interaction.reply({ content: `Notes cleared for **${user.tag}**.`, ephemeral: true });
    }
    const notes = get(interaction.guild.id, user.id);
    if (!notes.length) {
      return interaction.reply({ content: 'No notes.', ephemeral: true });
    }
    const lines = notes
      .slice(-20)
      .map((n, i) => `**${i + 1}.** ${n.text}\n by <@${n.modId}> • <t:${Math.floor(n.at / 1000)}:R>`)
      .join('\n\n');
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle(`Notes — ${user.tag}`)
          .setDescription(lines),
      ],
      ephemeral: true,
    });
  },
};
