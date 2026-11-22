const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your cheese coin balance')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(false)),
  async execute(interaction, client, config) {
    if (config.economy?.enabled === false) {
      return interaction.reply({ content: 'Economy is disabled.', ephemeral: true });
    }
    const user = interaction.options.getUser('user') || interaction.user;
    const { user: data } = get(interaction.guild.id, user.id);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${user.username}'s Wallet`)
      .setDescription(`🧀 **${data.coins}** cheese coins`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));
    await interaction.reply({ embeds: [embed] });
  },
};
