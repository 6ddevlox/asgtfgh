const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const squeaks = [
  'SQUEAK!',
  '*aggressive squeaking*',
  'squeak squeak squeak',
  'SQUEEEAAAKKK',
  '*tiny angry rat noises*',
  'squeak... squeak... SQUEAK!',
  '*nuzzles your ankle then bites it*',
  'The rats are plotting.',
  'Cheese detected. Initiating raid.',
  '*stares at you judgmentally*',
  'You have been claimed by the mischief.',
  'Squeak means "I own this place now."',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('squeak')
    .setDescription('Make the bot squeak'),
  async execute(interaction, client, config) {
    const message = squeaks[Math.floor(Math.random() * squeaks.length)];

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setDescription(message)
      .setFooter({ text: '🐀' });

    await interaction.reply({ embeds: [embed] });
  },
};
