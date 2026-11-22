const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, addCoins, setWork } = require('../../utils/economy');

const jobs = [
  'sorted cheese in the warehouse',
  'scouted a new tunnel',
  'won a VR duel exhibition',
  'fixed a broken banana launcher',
  'trained new rats in parkour',
  'cleaned the lobby cameras',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work for cheese coins'),
  async execute(interaction, client, config) {
    if (config.economy?.enabled === false) {
      return interaction.reply({ content: 'Economy is disabled.', ephemeral: true });
    }
    const { user } = get(interaction.guild.id, interaction.user.id);
    const cd = 60 * 60 * 1000;
    if (Date.now() - (user.lastWork || 0) < cd) {
      const left = Math.ceil((cd - (Date.now() - user.lastWork)) / 60000);
      return interaction.reply({ content: `You're tired. Work again in **${left}m**.`, ephemeral: true });
    }
    const min = config.economy?.workMin || 25;
    const max = config.economy?.workMax || 75;
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;
    addCoins(interaction.guild.id, interaction.user.id, amount);
    setWork(interaction.guild.id, interaction.user.id);
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Work Complete')
      .setDescription(`You ${job} and earned **${amount}** 🧀.`);
    await interaction.reply({ embeds: [embed] });
  },
};
