const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const facts = [
  "Rats can laugh when they're tickled. Scientists have recorded them making ultrasonic giggle sounds.",
  'A group of rats is called a "mischief".',
  'Rats can jump up to 3 feet high from a standing position.',
  'Rats have extremely strong teeth — they can chew through wood, plastic, and even soft metals.',
  'Rats are neophobic (afraid of new things), which is why they often avoid traps at first.',
  'A rat can tread water for up to 3 days.',
  'Rats have poor eyesight but an incredible sense of smell and hearing.',
  'Rats can squeeze through holes the size of a quarter because their skeletons are very flexible.',
  'Rats are highly social and can form strong bonds with both other rats and humans.',
  'The average lifespan of a pet rat is 2–3 years.',
  'Rats can recognize their names and come when called (if trained).',
  'There are over 60 different species of rats.',
  'Rats are cleaner than most people think — they spend a lot of time grooming themselves.',
  'In some cultures, rats are considered sacred and bring good luck.',
  'Rats can remember pathways and solve complex mazes thanks to their excellent spatial memory.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ratfact')
    .setDescription('Get a random rat fact'),
  async execute(interaction, client, config) {
    const fact = facts[Math.floor(Math.random() * facts.length)];

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🐀 Rat Fact')
      .setDescription(fact)
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
