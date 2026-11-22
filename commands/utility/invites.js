const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { leaderboard, getUser } = require('../../utils/invites');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Check invite stats')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(false))
    .addBooleanOption(o => o.setName('leaderboard').setDescription('Show top inviters').setRequired(false)),
  async execute(interaction, client, config) {
    if (interaction.options.getBoolean('leaderboard')) {
      const board = leaderboard(interaction.guild.id, 10);
      if (!board.length) {
        return interaction.reply({ content: 'No invite data yet.', ephemeral: true });
      }
      const lines = await Promise.all(
        board.map(async (e, i) => {
          let name = e.id;
          try { name = (await client.users.fetch(e.id)).username; } catch (_) {}
          return `**${i + 1}.** ${name} — **${e.joins}** joins`;
        })
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('Invite Leaderboard')
            .setDescription(lines.join('\n')),
        ],
      });
    }
    const user = interaction.options.getUser('user') || interaction.user;
    const joins = getUser(interaction.guild.id, user.id);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`**${user.username}** has invited **${joins}** members.`),
      ],
    });
  },
};
