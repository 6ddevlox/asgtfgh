const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const quotes = [
  '"In the sewers, the bold survive."',
  '"Cheese is temporary. Glory is forever."',
  '"A true rat never runs... unless it\'s a tactical retreat."',
  '"The night belongs to those with sharp teeth."',
  '"They call us pests. We call ourselves free."',
  '"One rat is a nuisance. A mischief is an army."',
  '"Climb higher. Bite harder."',
  '"The weak get trapped. The clever get the cheese."',
  '"Stay low. Stay quiet. Strike first."',
  '"Every scar is a story the surface dwellers will never understand."',
  '"We don\'t hide in the dark. We own it."',
  '"Squeak softly and carry a big stick."',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ratzquote')
    .setDescription('Get a motivational Ratz quote'),
  async execute(interaction, client, config) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🐀 Words of the Ratz')
      .setDescription(quote)
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
