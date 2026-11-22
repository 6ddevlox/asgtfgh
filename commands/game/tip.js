const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const tips = [
  'Master the grab and climb mechanics — good movement wins fights.',
  'Don’t stand still. Monkes that stay still get tagged (or shot).',
  'Learn the map layouts. Knowing high ground and cover is huge.',
  'Sound is important in VR. Listen for footsteps and gunshots.',
  'Practice your aim in empty lobbies before jumping into competitive ones.',
  'Communication with teammates can turn a losing fight around.',
  'Watch your stamina / grip. Running out mid-fight is a bad time.',
  'Use the environment — bounce, climb, and swing creatively.',
  'Keep your headset and controllers charged. Nothing worse than dying mid-match to low battery.',
  'Be a good sport. Trash talk is fine, toxicity isn’t.',
  'Warm up your arms. Gorilla Tag movement can be a workout.',
  'If you’re new, watch better players and copy their movement.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tip')
    .setDescription('Get a random gameplay tip'),
  async execute(interaction, client, config) {
    const tip = tips[Math.floor(Math.random() * tips.length)];

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('💡 Pro Tip')
      .setDescription(tip)
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
