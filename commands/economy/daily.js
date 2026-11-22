const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, addCoins, setDaily } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily cheese coins'),
  async execute(interaction, client, config) {
    if (config.economy?.enabled === false) {
      return interaction.reply({ content: 'Economy is disabled.', ephemeral: true });
    }
    const { user } = get(interaction.guild.id, interaction.user.id);
    const cd = 24 * 60 * 60 * 1000;
    if (Date.now() - (user.lastDaily || 0) < cd) {
      const left = cd - (Date.now() - user.lastDaily);
      const h = Math.ceil(left / 3600000);
      return interaction.reply({ content: `Daily already claimed. Come back in ~**${h}h**.`, ephemeral: true });
    }
    const amount = config.economy?.dailyAmount || 100;
    addCoins(interaction.guild.id, interaction.user.id, amount);
    setDaily(interaction.guild.id, interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle('Daily Claimed')
      .setDescription(`You received **${amount}** 🧀 cheese coins!`);
    await interaction.reply({ embeds: [embed] });
  },
};
