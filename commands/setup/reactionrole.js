const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { readJSON, writeJSON } = require('../../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction-role panel')
    .addStringOption(opt =>
      opt
        .setName('title')
        .setDescription('Title of the panel')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('description')
        .setDescription('Description shown on the panel')
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('role1').setDescription('First role').setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('emoji1')
        .setDescription('Emoji for role 1 (unicode or custom name)')
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('role2').setDescription('Second role').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('emoji2').setDescription('Emoji for role 2').setRequired(false)
    )
    .addRoleOption(opt =>
      opt.setName('role3').setDescription('Third role').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('emoji3').setDescription('Emoji for role 3').setRequired(false)
    )
    .addRoleOption(opt =>
      opt.setName('role4').setDescription('Fourth role').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('emoji4').setDescription('Emoji for role 4').setRequired(false)
    )
    .addRoleOption(opt =>
      opt.setName('role5').setDescription('Fifth role').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('emoji5').setDescription('Emoji for role 5').setRequired(false)
    )
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to post the panel in (default: here)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction, client, config) {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const targetChannel =
      interaction.options.getChannel('channel') || interaction.channel;

    const pairs = [];
    for (let i = 1; i <= 5; i++) {
      const role = interaction.options.getRole(`role${i}`);
      const emoji = interaction.options.getString(`emoji${i}`);
      if (role && emoji) pairs.push({ role, emoji: emoji.trim() });
    }

    if (!pairs.length) {
      return interaction.editReply('You need at least one role + emoji pair.');
    }

    // Build embed
    const lines = pairs.map(p => `${p.emoji} → **${p.role.name}**`);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(title)
      .setDescription(`${description}\n\n${lines.join('\n')}`)
      .setFooter({ text: 'React to get / remove a role' })
      .setTimestamp();

    let message;
    try {
      message = await targetChannel.send({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply(`Failed to send panel: ${err.message}`);
    }

    // React with each emoji
    const mapping = {};
    for (const p of pairs) {
      try {
        // Resolve custom emoji if possible
        let emojiToReact = p.emoji;
        const customMatch = p.emoji.match(/<?(a)?:?(\w+):(\d+)>?/);
        if (customMatch) {
          emojiToReact = customMatch[3]; // id
        }
        await message.react(emojiToReact);

        // Store key the same way events will look it up
        if (customMatch) {
          mapping[`id:${customMatch[3]}`] = p.role.id;
        } else {
          // Unicode / name
          mapping[`name:${p.emoji}`] = p.role.id;
        }
      } catch (err) {
        console.error(`Could not react with ${p.emoji}:`, err.message);
      }
    }

    // Persist
    const data = readJSON('reactionRoles.json', {});
    if (!data[interaction.guild.id]) data[interaction.guild.id] = {};
    data[interaction.guild.id][message.id] = mapping;
    writeJSON('reactionRoles.json', data);

    await interaction.editReply(
      `Reaction role panel posted in ${targetChannel}. Message ID: \`${message.id}\``
    );
  },
};
