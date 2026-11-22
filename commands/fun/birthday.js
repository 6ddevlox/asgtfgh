const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { set, get } = require('../../utils/birthdays');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Set or view your birthday')
    .addSubcommand(sc =>
      sc
        .setName('set')
        .setDescription('Set your birthday (MM-DD)')
        .addIntegerOption(o => o.setName('month').setDescription('Month 1-12').setRequired(true).setMinValue(1).setMaxValue(12))
        .addIntegerOption(o => o.setName('day').setDescription('Day 1-31').setRequired(true).setMinValue(1).setMaxValue(31))
    )
    .addSubcommand(sc =>
      sc
        .setName('view')
        .setDescription('View a birthday')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(false))
    ),
  async execute(interaction, client, config) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'set') {
      const month = interaction.options.getInteger('month');
      const day = interaction.options.getInteger('day');
      set(interaction.guild.id, interaction.user.id, month, day);
      return interaction.reply({
        content: `Birthday set to **${month}/${day}**.`,
        ephemeral: true,
      });
    }
    const user = interaction.options.getUser('user') || interaction.user;
    const b = get(interaction.guild.id, user.id);
    if (!b) {
      return interaction.reply({ content: 'No birthday set.', ephemeral: true });
    }
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`🎂 **${user.username}**: ${b.month}/${b.day}`),
      ],
    });
  },
};
