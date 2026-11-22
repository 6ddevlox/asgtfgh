const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const prefixes = [
  'Sewer', 'Cheese', 'Shadow', 'Night', 'Toxic', 'Rabid', 'Swift', 'Iron',
  'Blood', 'Ghost', 'Vile', 'Clever', 'Scrap', 'Dust', 'Ember', 'Frost',
  'Venom', 'Razor', 'Silent', 'Wild', 'Mad', 'Lucky', 'Dark', 'Golden'
];

const suffixes = [
  'Fang', 'Claw', 'Tail', 'Whisker', 'Bite', 'Scurry', 'Scamper', 'Nibbler',
  'Chewer', 'Runner', 'Stalker', 'Hunter', 'King', 'Queen', 'Lord', 'Fiend',
  'Menace', 'Bandit', 'Raider', 'Scout', 'Blade', 'Tooth', 'Snout', 'Paw'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ratname')
    .setDescription('Generate a random rat name'),
  async execute(interaction, client, config) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix}${suffix}`;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🐀 Your Rat Name')
      .setDescription(`**${name}**`)
      .setFooter({ text: `Generated for ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
