const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, addCoins } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay another user cheese coins')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(interaction, client, config) {
    if (config.economy?.enabled === false) {
      return interaction.reply({ content: 'Economy is disabled.', ephemeral: true });
    }
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (target.bot || target.id === interaction.user.id) {
      return interaction.reply({ content: 'Invalid target.', ephemeral: true });
    }
    const { user } = get(interaction.guild.id, interaction.user.id);
    if ((user.coins || 0) < amount) {
      return interaction.reply({ content: 'Not enough cheese coins.', ephemeral: true });
    }
    addCoins(interaction.guild.id, interaction.user.id, -amount);
    addCoins(interaction.guild.id, target.id, amount);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`Paid **${amount}** 🧀 to **${target.username}**.`),
      ],
    });
  },
};
