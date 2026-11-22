const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// ── Render / hosting health check ──────────────────────────────
// Keeps Web Service alive and responds on PORT
const http = require('node:http');
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('RATZ BOT is online 🐀');
  })
  .listen(PORT, () => {
    console.log(`Health server listening on port ${PORT}`);
  });


const config = require('./config.json');
const {
  nextNumber,
  openTicket,
  userHasOpenTicket,
} = require('./utils/tickets');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.User,
  ],
});

// ── Load commands ──────────────────────────────────────────────
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  if (!fs.statSync(commandsPath).isDirectory()) continue;
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] Command at ${filePath} is missing "data" or "execute".`);
    }
  }
}

// ── Load events ────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client, config));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client, config));
  }
}

// ── Interaction handler ────────────────────────────────────────
client.on(Events.InteractionCreate, async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName}`);
      return;
    }
    try {
      await command.execute(interaction, client, config);
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Error')
        .setDescription('There was an error while executing this command.')
        .setTimestamp();
      const payload = { embeds: [errorEmbed], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
    return;
  }

  // Buttons
  if (interaction.isButton()) {
    try {
      if (interaction.customId === 'ticket_open') {
        await handleTicketOpen(interaction, client, config);
      } else if (interaction.customId === 'verify_button') {
        await handleVerify(interaction, client, config);
      } else if (interaction.customId === 'ticket_close_btn') {
        const { getTicket, closeTicket } = require('./utils/tickets');
        const ticket = getTicket(interaction.guild.id, interaction.channel.id);
        if (!ticket) {
          return interaction.reply({ content: 'Not a ticket.', ephemeral: true });
        }
        closeTicket(interaction.guild.id, interaction.channel.id);
        await interaction.reply({ content: 'Closing ticket…' });
        setTimeout(() => interaction.channel.delete('Ticket closed').catch(() => {}), 3000);
      } else if (interaction.customId.startsWith('suggest_')) {
        await handleSuggestionButton(interaction, client, config);
      } else if (interaction.customId.startsWith('lfg_')) {
        await handleLFG(interaction, client, config);
      } else if (interaction.customId === 'staff_apply') {
        await handleStaffApplyButton(interaction, client, config);
      } else if (interaction.customId === 'ticket_appeal') {
        await handleTicketOpen(interaction, client, config, 'appeal');
      } else if (interaction.customId === 'giveaway_enter') {
        await handleGiveawayEnter(interaction, client, config);
      }
    } catch (err) {
      console.error('Button handler error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true }).catch(() => {});
      }
    }
    return;
  }

  // Select menus (role dropdown)
  if (interaction.isStringSelectMenu()) {
    try {
      if (interaction.customId === 'select_roles') {
        await handleSelectRoles(interaction, client, config);
      }
    } catch (err) {
      console.error('Select menu error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true }).catch(() => {});
      }
    }
    return;
  }

  // Modal submit (staff application)
  if (interaction.isModalSubmit()) {
    try {
      if (interaction.customId === 'staff_app_modal') {
        await handleStaffAppSubmit(interaction, client, config);
      }
    } catch (err) {
      console.error('Modal error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true }).catch(() => {});
      }
    }
  }
});

async function handleTicketOpen(interaction, client, config, ticketType = 'support') {
  await interaction.deferReply({ ephemeral: true });

  const { userHasOpenTicket: hasOpen, nextNumber: next, openTicket: open } = require('./utils/tickets');
  if (hasOpen(interaction.guild.id, interaction.user.id)) {
    return interaction.editReply('You already have an open ticket.');
  }

  if (!config.ticketCategoryId) {
    return interaction.editReply(
      'Tickets are not configured yet. An admin must run `/setticketcategory`.'
    );
  }

  const number = next(interaction.guild.id);
  const prefix = ticketType === 'appeal' ? 'appeal' : 'ticket';
  const name = `${prefix}-${number}-${interaction.user.username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 90);

  const overwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      id: client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
      ],
    },
  ];

  if (config.ticketSupportRoleId) {
    overwrites.push({
      id: config.ticketSupportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  let channel;
  try {
    channel = await interaction.guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      permissionOverwrites: overwrites,
      topic: `Ticket #${number} • ${interaction.user.tag} (${interaction.user.id})`,
    });
  } catch (err) {
    console.error(err);
    return interaction.editReply('Failed to create ticket channel. Check bot permissions.');
  }

  open(interaction.guild.id, channel.id, interaction.user.id, number);

  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(ticketType === 'appeal' ? `Appeal #${number}` : `Ticket #${number}`)
    .setDescription(
      `Hey <@${interaction.user.id}>!\n\n${ticketType === 'appeal' ? 'Explain why you are appealing your ban. Be honest.' : 'Staff will be with you shortly.\nDescribe your issue clearly.'}\n\nUse \`/close\` when you're done.`
    )
    .setFooter({ text: 'RATZ Support' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close_btn')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  const supportPing = config.ticketSupportRoleId
    ? `<@&${config.ticketSupportRoleId}>`
    : '';

  await channel.send({
    content: `${supportPing} <@${interaction.user.id}>`.trim(),
    embeds: [embed],
    components: [row],
  });

  await interaction.editReply(`Ticket created: ${channel}`);
}

async function handleVerify(interaction, client, config) {
  await interaction.deferReply({ ephemeral: true });

  if (!config.verification?.enabled) {
    return interaction.editReply('Verification is not enabled.');
  }

  const member = interaction.member;
  try {
    if (config.unverifiedRoleId && member.roles.cache.has(config.unverifiedRoleId)) {
      await member.roles.remove(config.unverifiedRoleId, 'Verified');
    }
    if (config.memberRoleId && !member.roles.cache.has(config.memberRoleId)) {
      await member.roles.add(config.memberRoleId, 'Verified');
    }
    await interaction.editReply('✅ You are verified! Welcome to the server.');
  } catch (err) {
    console.error('Verify failed:', err.message);
    await interaction.editReply(
      'Could not update your roles. Ask staff to check the bot\'s role hierarchy.'
    );
  }
}


async function handleSuggestionButton(interaction, client, config) {
  const { getSuggestion, setStatus } = require('./utils/suggestions');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const msg = interaction.message;
  const suggestion = getSuggestion(interaction.guild.id, msg.id);
  if (!suggestion) {
    return interaction.reply({ content: 'Suggestion data not found.', ephemeral: true });
  }

  const id = interaction.customId;
  const isStaff =
    interaction.memberPermissions?.has?.('ManageMessages') ||
    (config.suggestions?.staffRoleId &&
      interaction.member.roles.cache.has(config.suggestions.staffRoleId));

  if (id === 'suggest_approve' || id === 'suggest_deny') {
    if (!isStaff) {
      return interaction.reply({ content: 'Only staff can approve/deny.', ephemeral: true });
    }
    const status = id === 'suggest_approve' ? 'approved' : 'denied';
    setStatus(interaction.guild.id, msg.id, status);

    const embed = msg.embeds[0];
    if (embed) {
      const data = EmbedBuilder.from(embed)
        .spliceFields(0, 1, {
          name: 'Status',
          value: status === 'approved' ? '✅ Approved' : '❌ Denied',
          inline: true,
        })
        .setColor(status === 'approved' ? 0x22c55e : 0xef4444);
      await msg.edit({ embeds: [data], components: msg.components });
    }
    return interaction.reply({ content: `Suggestion ${status}.`, ephemeral: true });
  }

  if (!client.suggestionVotes) client.suggestionVotes = new Map();
  const key = msg.id;
  if (!client.suggestionVotes.has(key)) {
    client.suggestionVotes.set(key, { up: new Set(), down: new Set() });
  }
  const votes = client.suggestionVotes.get(key);

  if (id === 'suggest_up') {
    votes.down.delete(interaction.user.id);
    if (votes.up.has(interaction.user.id)) votes.up.delete(interaction.user.id);
    else votes.up.add(interaction.user.id);
  } else if (id === 'suggest_down') {
    votes.up.delete(interaction.user.id);
    if (votes.down.has(interaction.user.id)) votes.down.delete(interaction.user.id);
    else votes.down.add(interaction.user.id);
  }

  const newRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('suggest_up')
      .setLabel(String(votes.up.size))
      .setStyle(ButtonStyle.Success)
      .setEmoji('👍'),
    new ButtonBuilder()
      .setCustomId('suggest_down')
      .setLabel(String(votes.down.size))
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

  await msg.edit({ components: [newRow] });
  await interaction.deferUpdate();
}

async function handleSelectRoles(interaction, client, config) {
  await interaction.deferReply({ ephemeral: true });
  const { getPanel } = require('./utils/selectRoles');
  const panel = getPanel(interaction.guild.id, interaction.message.id);
  if (!panel) {
    return interaction.editReply('This role menu is no longer active.');
  }

  const selected = new Set(interaction.values);
  const member = interaction.member;
  const allRoleIds = panel.options.map(o => o.roleId);
  const added = [];
  const removed = [];

  for (const roleId of allRoleIds) {
    const has = member.roles.cache.has(roleId);
    const want = selected.has(roleId);
    try {
      if (want && !has) {
        await member.roles.add(roleId, 'Select menu roles');
        added.push(roleId);
      } else if (!want && has) {
        await member.roles.remove(roleId, 'Select menu roles');
        removed.push(roleId);
      }
    } catch (err) {
      console.error('Role update failed:', err.message);
    }
  }

  const parts = [];
  if (added.length) parts.push('Added: ' + added.map(id => '<@&' + id + '>').join(', '));
  if (removed.length) parts.push('Removed: ' + removed.map(id => '<@&' + id + '>').join(', '));
  if (!parts.length) parts.push('No role changes.');

  await interaction.editReply(parts.join('\n'));
}



async function handleLFG(interaction, client, config) {
  const type = interaction.customId.replace('lfg_', '');
  const labels = { duo: 'Duo', squad: 'Squad', fill: 'Fill / Any' };
  const label = labels[type] || type;

  const rolePing = config.lfg?.roleId ? `<@&${config.lfg.roleId}>` : '';
  const content =
    `${rolePing} **${interaction.user}** is looking for **${label}**!\n` +
    `Reply or use \`/lobby code:XXXX\` to share a code.`.trim();

  await interaction.reply({ content });
}

async function handleStaffApplyButton(interaction, client, config) {
  const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
  } = require('discord.js');

  const modal = new ModalBuilder()
    .setCustomId('staff_app_modal')
    .setTitle('Staff Application');

  const age = new TextInputBuilder()
    .setCustomId('app_age')
    .setLabel('Age')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(10);

  const experience = new TextInputBuilder()
    .setCustomId('app_experience')
    .setLabel('Moderation / community experience')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const why = new TextInputBuilder()
    .setCustomId('app_why')
    .setLabel('Why do you want to be staff?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const timezone = new TextInputBuilder()
    .setCustomId('app_timezone')
    .setLabel('Timezone & availability')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  modal.addComponents(
    new ActionRowBuilder().addComponents(age),
    new ActionRowBuilder().addComponents(experience),
    new ActionRowBuilder().addComponents(why),
    new ActionRowBuilder().addComponents(timezone)
  );

  await interaction.showModal(modal);
}

async function handleStaffAppSubmit(interaction, client, config) {
  await interaction.deferReply({ ephemeral: true });

  if (!config.staffAppChannelId) {
    return interaction.editReply('Staff applications are not configured.');
  }

  const channel = interaction.guild.channels.cache.get(config.staffAppChannelId);
  if (!channel?.isTextBased()) {
    return interaction.editReply('Review channel not found.');
  }

  const age = interaction.fields.getTextInputValue('app_age');
  const experience = interaction.fields.getTextInputValue('app_experience');
  const why = interaction.fields.getTextInputValue('app_why');
  const timezone = interaction.fields.getTextInputValue('app_timezone');

  const { EmbedBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('New Staff Application')
    .setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .addFields(
      { name: 'User', value: `<@${interaction.user.id}> (${interaction.user.id})` },
      { name: 'Age', value: age, inline: true },
      { name: 'Timezone / Availability', value: timezone, inline: true },
      { name: 'Experience', value: experience.slice(0, 1024) },
      { name: 'Why staff?', value: why.slice(0, 1024) }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.editReply('Application submitted. Staff will review it.');
}



async function handleGiveawayEnter(interaction, client, config) {
  const { get, save } = require('./utils/giveaways');
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const data = get(interaction.guild.id, interaction.message.id);
  if (!data) {
    return interaction.reply({ content: 'This giveaway has ended.', ephemeral: true });
  }
  if (Date.now() > data.endsAt) {
    return interaction.reply({ content: 'This giveaway has ended.', ephemeral: true });
  }
  if (!data.entries) data.entries = [];
  if (data.entries.includes(interaction.user.id)) {
    data.entries = data.entries.filter(id => id !== interaction.user.id);
    save(interaction.guild.id, interaction.message.id, data);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel(`Enter (${data.entries.length})`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎉')
    );
    await interaction.message.edit({ components: [row] }).catch(() => {});
    return interaction.reply({ content: 'You left the giveaway.', ephemeral: true });
  }
  data.entries.push(interaction.user.id);
  save(interaction.guild.id, interaction.message.id, data);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('giveaway_enter')
      .setLabel(`Enter (${data.entries.length})`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎉')
  );
  await interaction.message.edit({ components: [row] }).catch(() => {});
  await interaction.reply({ content: 'You entered the giveaway!', ephemeral: true });
}


client.login(process.env.DISCORD_TOKEN);
