const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevelchannel')
    .setDescription('Set the channel where level-up announcements are posted')
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Text channel for level-ups (leave empty to use the chat where they level)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const channel = interaction.options.getChannel('channel');
    const configPath = path.join(__dirname, '..', '..', 'config.json');

    config.levelUpChannelId = channel ? channel.id : null;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Level-up Channel Updated')
      .setDescription(
        channel
          ? `Level-ups will now be announced in ${channel}.`
          : 'Level-ups will now post in the same channel the user is chatting in.'
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
