const recentMessages = new Map();
const warnCounts = new Map();

const NSFW_DOMAINS = [
  'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn',
  'onlyfans', 'fansly', 'chaturbate', 'stripchat', 'brazzers',
  'nhentai', 'hanime', 'rule34', 'e621', 'gelbooru',
];

const SUSPICIOUS_EXT = ['.exe', '.scr', '.bat', '.cmd', '.js', '.vbs', '.msi', '.apk'];

function isInvite(content) {
  return /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/i.test(content);
}

function capsRatio(content) {
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 1) return 0;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length;
}

function emojiCount(content) {
  const custom = (content.match(/<a?:[\w]+:\d+>/g) || []).length;
  const unicode = (content.match(/\p{Extended_Pictographic}/gu) || []).length;
  return custom + unicode;
}

function mentionCount(message) {
  return message.mentions.users.size + message.mentions.roles.size;
}

function trackSpam(userId, windowSeconds) {
  const now = Date.now();
  if (!recentMessages.has(userId)) recentMessages.set(userId, []);
  const list = recentMessages.get(userId);
  list.push(now);
  const cutoff = now - windowSeconds * 1000;
  while (list.length && list[0] < cutoff) list.shift();
  return list.length;
}

function incrementWarn(userId) {
  const n = (warnCounts.get(userId) || 0) + 1;
  warnCounts.set(userId, n);
  return n;
}

function containsToxicity(content, words) {
  const lower = content.toLowerCase();
  return words.some(w => lower.includes(w.toLowerCase()));
}

function hasNSFWLink(content) {
  const lower = content.toLowerCase();
  return NSFW_DOMAINS.some(d => lower.includes(d));
}

function hasSuspiciousAttachment(message) {
  if (!message.attachments?.size) return false;
  for (const att of message.attachments.values()) {
    const name = (att.name || '').toLowerCase();
    if (SUSPICIOUS_EXT.some(ext => name.endsWith(ext))) return true;
  }
  return false;
}

function checkMessage(message, config, blacklistedPhrase = null) {
  if (!config?.enabled) return { action: null, reason: null };
  if (message.author.bot) return { action: null, reason: null };
  if (message.member?.permissions?.has?.('ManageMessages')) {
    return { action: null, reason: null };
  }

  const content = message.content || '';

  if (blacklistedPhrase) {
    return { action: 'delete', reason: `Blacklisted phrase: "${blacklistedPhrase}"` };
  }

  if (containsToxicity(content, config.toxicityWords || [])) {
    return { action: 'mute', reason: 'Toxic / prohibited language' };
  }

  if (config.blockNSFWLinks && hasNSFWLink(content)) {
    return { action: 'delete', reason: 'NSFW / adult links are not allowed' };
  }

  if (config.blockSuspiciousAttachments && hasSuspiciousAttachment(message)) {
    return { action: 'delete', reason: 'Suspicious file attachment blocked' };
  }

  if (config.blockInvites && isInvite(content)) {
    return { action: 'delete', reason: 'Discord invite links are not allowed' };
  }

  if (config.maxMentions && mentionCount(message) > config.maxMentions) {
    return { action: 'delete', reason: `Too many mentions (max ${config.maxMentions})` };
  }

  if (config.maxEmojis && emojiCount(content) > config.maxEmojis) {
    return { action: 'delete', reason: `Too many emojis (max ${config.maxEmojis})` };
  }

  if (
    config.blockExcessiveCaps &&
    content.length >= (config.minCapsLength || 12) &&
    capsRatio(content) >= (config.capsThreshold || 0.7)
  ) {
    return { action: 'delete', reason: 'Excessive capital letters' };
  }

  const spamCount = trackSpam(message.author.id, config.spamWindowSeconds || 7);
  if (spamCount >= (config.spamThreshold || 5)) {
    return { action: 'mute', reason: 'Message spam detected' };
  }

  return { action: null, reason: null };
}

module.exports = {
  checkMessage,
  incrementWarn,
  isInvite,
  containsToxicity,
  hasNSFWLink,
};
