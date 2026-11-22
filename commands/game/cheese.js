const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
  'You found a piece of cheddar. +1 respect from the rats.',
  'This cheese is mid. The rats are disappointed.',
  'Legendary cheese acquired. The mischief bows to you.',
  'You dropped the cheese. A smaller rat stole it.',
  'Aged gouda detected. Status: elite.',
  'This is just plastic cheese. Get out.',
  'The holy block of swiss has blessed you.',
  'Rats are now following you. They smell the goods.',
  'You ate the cheese. The rats will remember this betrayal.',
  'Perfectly aged. The sewer kings approve.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cheese')
    .setDescription('Inspect a random piece of cheese'),
  async execute(interaction, client, config) {
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor('#f59e0b')
      .setTitle('🧀 Cheese Inspection')
      .setDescription(response)
      .setFooter({ text: 'The rats are watching.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
