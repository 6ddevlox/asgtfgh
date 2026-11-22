const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setSticky, clearSticky, getSticky } = require('../../utils/sticky');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manage sticky messages in this channel')
    .addSubcommand(sc =>
      sc
        .setName('set')
        .setDescription('Set a sticky message')
        .addStringOption(o =>
          o.setName('content').setDescription('Message text (supports basic markdown)').setRequired(true)
        )
    )
    .addSubcommand(sc => sc.setName('clear').setDescription('Remove the sticky message'))
    .addSubcommand(sc => sc.setName('show').setDescription('Show current sticky'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    const channel = interaction.channel;
    const guildId = interaction.guild.id;

    if (sub === 'clear') {
      const existing = getSticky(guildId, channel.id);
      if (existing?.lastMessageId) {
        await channel.messages.delete(existing.lastMessageId).catch(() => {});
      }
      clearSticky(guildId, channel.id);
      return interaction.reply({ content: 'Sticky cleared.', ephemeral: true });
    }

    if (sub === 'show') {
      const s = getSticky(guildId, channel.id);
      if (!s) return interaction.reply({ content: 'No sticky in this channel.', ephemeral: true });
      return interaction.reply({ content: `Current sticky:\n>>> ${s.content}`, ephemeral: true });
    }

    // set
    const content = interaction.options.getString('content');
    const existing = getSticky(guildId, channel.id);
    if (existing?.lastMessageId) {
      await channel.messages.delete(existing.lastMessageId).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setDescription(content)
      .setFooter({ text: '📌 Sticky message' });

    const msg = await channel.send({ embeds: [embed] });
    setSticky(guildId, channel.id, content, msg.id);

    await interaction.reply({ content: 'Sticky set.', ephemeral: true });
  },
};
