const { SlashCommandBuilder, EmbedBuilder, OAuth2Scopes, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link'),
  async execute(interaction, client, config) {
    const inviteUrl = client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ViewChannel,
      ],
    });

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Invite RatzBot')
      .setDescription(`[Click here to invite the bot to your server](${inviteUrl})`)
      .setFooter({ text: 'Make sure to give it the right permissions!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
