const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a simple yes/no poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    ),
  async execute(interaction, client, config) {
    const question = interaction.options.getString('question');

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({
        name: `Poll by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(question)
      .setDescription('React with 👍 or 👎')
      .setTimestamp();

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('👍');
    await message.react('👎');
  },
};
