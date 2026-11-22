const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const answers = [
  'Yes.', 'No.', 'Maybe.', 'Ask again later.', 'Definitely.',
  'Absolutely not.', 'The rats say yes.', 'The rats say no.',
  'Outlook good.', 'Don\'t count on it.', 'Without a doubt.',
  'Very doubtful.', 'Signs point to yes.', 'Better not tell you now.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic rat ball')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
  async execute(interaction, client, config) {
    const q = interaction.options.getString('question');
    const a = answers[Math.floor(Math.random() * answers.length)];
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle('🎱 Rat Ball')
          .addFields(
            { name: 'Question', value: q },
            { name: 'Answer', value: a }
          ),
      ],
    });
  },
};
