const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  async execute(interaction, client, config) {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${config.botName} — Command List`)
      .setDescription(`Everything for the **${config.gameName}** community`)
      .addFields(
        {
          name: '🎮 Game & Fun',
          value:
            '`/gameinfo` `/rules` `/status` `/tip` `/lfg` `/lobby`\n' +
            '`/report` `/stats` `/leaderboard` `/ratfact` `/howrat`\n' +
            '`/ratname` `/squeak` `/cheese` `/ratzquote` `/8ball` `/coinflip` `/afk`',
        },
        {
          name: '📈 Levels & Economy',
          value:
            '`/rank` `/xpleaderboard` `/setlevel`\n' +
            '`/balance` `/daily` `/work` `/pay` `/coinleaderboard`',
        },
        {
          name: '🎉 Community',
          value:
            '`/suggest` `/giveaway` `/birthday` `/remind` `/snipe`\n' +
            '`/invites` `/serverstats` `/lfgpanel` `/sticky`',
        },
        {
          name: '🎫 Tickets & Staff',
          value: '`/ticketpanel` `/appealpanel` `/close` `/staffapp` `/note`',
        },
        {
          name: '🛡️ Moderation',
          value:
            '`/kick` `/ban` `/timeout` `/purge` `/say` `/lock` `/slowmode`\n' +
            '`/warn` `/warnings` `/clearwarns` `/raidmode` `/lockdown`\n' +
            '`/blacklist` `/voicejoin` `/voiceleave`',
        },
        {
          name: '⚙️ Setup (Admin)',
          value:
            '`/setlevelchannel` `/setlogchannel` `/setmessagelog` `/setstarboard`\n' +
            '`/setticketcategory` `/setverification` `/setautorole` `/setsuggestions`\n' +
            '`/tempvoice` `/levelrole` `/channelmode` `/autorespond`\n' +
            '`/selectroles` `/reactionrole` `/config`',
        }
      )
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
