const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setverification')
    .setDescription('Configure verification gate and post the verify button')
    .addRoleOption(opt =>
      opt.setName('unverified').setDescription('Role given on join (locked)').setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('member').setDescription('Role given after verifying').setRequired(true)
    )
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to post the verify button in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName('enabled').setDescription('Enable verification gate').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client, config) {
    const unverified = interaction.options.getRole('unverified');
    const memberRole = interaction.options.getRole('member');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const enabled = interaction.options.getBoolean('enabled');

    const configPath = path.join(__dirname, '..', '..', 'config.json');
    config.unverifiedRoleId = unverified.id;
    config.memberRoleId = memberRole.id;
    config.verifiedRoleId = memberRole.id;
    if (enabled !== null) {
      if (!config.verification) config.verification = {};
      config.verification.enabled = enabled;
    } else {
      if (!config.verification) config.verification = {};
      config.verification.enabled = true;
    }
    config.verificationChannelId = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Verification')
      .setDescription(
        `Welcome to **${config.gameName}**!\n\n` +
          `Click the button below to verify and unlock the server.\n` +
          `By verifying you agree to follow the rules.`
      )
      .setFooter({ text: 'Stay sharp. Stay Ratz.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅')
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content:
        `Verification configured.\n` +
        `• Unverified role: ${unverified}\n` +
        `• Member role: ${memberRole}\n` +
        `• Panel posted in ${channel}\n` +
        `• Enabled: **${config.verification.enabled}**`,
      ephemeral: true,
    });
  },
};
