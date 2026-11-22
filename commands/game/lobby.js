const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lobby')
    .setDescription('Post a lobby code for others to join')
    .addStringOption(opt =>
      opt.setName('code').setDescription('Lobby / room code').setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('mode')
        .setDescription('Game mode or map')
        .setRequired(false)
    )
    .addIntegerOption(opt =>
      opt
        .setName('slots')
        .setDescription('Open slots')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(16)
    ),
  async execute(interaction, client, config) {
    const code = interaction.options.getString('code');
    const mode = interaction.options.getString('mode');
    const slots = interaction.options.getInteger('slots');

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🎮 Lobby Open')
      .setDescription(
        `**Code:** \`${code}\`\n` +
          (mode ? `**Mode:** ${mode}\n` : '') +
          (slots ? `**Slots:** ${slots}\n` : '') +
          `\nHosted by <@${interaction.user.id}>`
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Jump in and stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
