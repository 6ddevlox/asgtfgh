const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Server and game rules'),
  async execute(interaction, client, config) {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📜 Rules')
      .setDescription('Follow these rules to keep the community fun for everyone.')
      .addFields(
        {
          name: '1. Be Respectful',
          value: 'No racism, sexism, hate speech, harassment, or toxicity. Treat everyone like a fellow monke.',
        },
        {
          name: '2. No Cheating / Exploiting',
          value: 'Using cheats, hacks, or exploits in the game or Discord will result in a ban.',
        },
        {
          name: '3. No Spamming',
          value: 'Don’t spam messages, mentions, or emojis. Keep channels clean.',
        },
        {
          name: '4. Keep it Appropriate',
          value: 'No NSFW content. This is a community for all ages (within reason for VR).',
        },
        {
          name: '5. Listen to Staff',
          value: 'Staff decisions are final. Argue in tickets, not in public chat.',
        },
        {
          name: '6. Game Specific',
          value: 'Don’t use offensive room names or usernames. Report griefers and cheaters properly.',
        }
      )
      .setFooter({ text: 'Breaking rules can lead to mute, kick, or permanent ban.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
