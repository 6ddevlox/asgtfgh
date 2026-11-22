const { readJSON, writeJSON } = require('./storage');

const LEVELS_FILE = 'levels.json';

function getLevels() {
  return readJSON(LEVELS_FILE, {});
}

function saveLevels(data) {
  writeJSON(LEVELS_FILE, data);
}

function xpForLevel(level) {
  // Simple progressive curve
  return Math.floor(100 * Math.pow(level, 1.45));
}

function totalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

function levelFromTotalXp(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
    if (level > 200) break;
  }
  return { level, currentXp: remaining, needed: xpForLevel(level) };
}

function getUser(guildId, userId) {
  const data = getLevels();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = { xp: 0, level: 1, lastMessage: 0 };
  }
  return { data, user: data[guildId][userId] };
}

function addXp(guildId, userId, amount, cooldownMs) {
  const { data, user } = getUser(guildId, userId);
  const now = Date.now();

  if (cooldownMs && now - (user.lastMessage || 0) < cooldownMs) {
    return { leveledUp: false, user, skipped: true };
  }

  user.lastMessage = now;
  user.xp = (user.xp || 0) + amount;

  const { level, currentXp, needed } = levelFromTotalXp(user.xp);
  const oldLevel = user.level || 1;
  user.level = level;
  user.currentXp = currentXp;
  user.needed = needed;

  saveLevels(data);

  return {
    leveledUp: level > oldLevel,
    oldLevel,
    newLevel: level,
    user,
    skipped: false,
  };
}

function setUserLevel(guildId, userId, level, xpInLevel = 0) {
  const { data, user } = getUser(guildId, userId);
  const safeLevel = Math.max(1, Math.min(200, Number(level) || 1));
  user.level = safeLevel;
  user.xp = totalXpForLevel(safeLevel) + Math.max(0, xpInLevel);
  const progress = levelFromTotalXp(user.xp);
  user.currentXp = progress.currentXp;
  user.needed = progress.needed;
  saveLevels(data);
  return user;
}

function getLeaderboard(guildId, limit = 10) {
  const data = getLevels();
  const guild = data[guildId] || {};
  return Object.entries(guild)
    .map(([id, u]) => ({ id, xp: u.xp || 0, level: u.level || 1 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

module.exports = {
  addXp,
  setUserLevel,
  getUser,
  getLeaderboard,
  xpForLevel,
  levelFromTotalXp,
  getLevels,
};
