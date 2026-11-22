const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { addSuggestion } = require('../../utils/suggestions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the community / game')
    .addStringOption(opt =>
      opt.setName('idea').setDescription('Your suggestion').setRequired(true)
    ),
  async execute(interaction, client, config) {
    const idea = interaction.options.getString('idea');

    let channel = interaction.channel;
    if (config.suggestions?.channelId) {
      const ch = interaction.guild.channels.cache.get(config.suggestions.channelId);
      if (ch?.isTextBased()) channel = ch;
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle('💡 Suggestion')
      .setDescription(idea)
      .addFields({ name: 'Status', value: 'Pending', inline: true })
      .setFooter({ text: `ID: pending` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('suggest_up')
        .setLabel('0')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId('suggest_down')
        .setLabel('0')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎'),
      new ButtonBuilder()
        .setCustomId('suggest_approve')
        .setLabel('Approve')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('suggest_deny')
        .setLabel('Deny')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    // Update footer with real id
    embed.setFooter({ text: `ID: ${msg.id}` });
    await msg.edit({ embeds: [embed] });

    addSuggestion(interaction.guild.id, msg.id, interaction.user.id, idea);

    if (channel.id !== interaction.channel.id) {
      await interaction.reply({
        content: `Suggestion posted in ${channel}.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'Suggestion submitted!', ephemeral: true });
    }
  },
};
