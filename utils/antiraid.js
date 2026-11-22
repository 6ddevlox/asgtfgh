const joinTracker = new Map(); // guildId -> [{ id, joinedAt }]
const lockdowns = new Map();   // guildId -> unlockAt

function trackJoin(guildId, memberId, windowSeconds) {
  const now = Date.now();
  if (!joinTracker.has(guildId)) joinTracker.set(guildId, []);
  const list = joinTracker.get(guildId);
  list.push({ id: memberId, joinedAt: now });
  // prune
  const cutoff = now - windowSeconds * 1000;
  while (list.length && list[0].joinedAt < cutoff) list.shift();
  return list.length;
}

function isLocked(guildId) {
  const until = lockdowns.get(guildId);
  if (!until) return false;
  if (Date.now() >= until) {
    lockdowns.delete(guildId);
    return false;
  }
  return true;
}

function setLockdown(guildId, minutes) {
  lockdowns.set(guildId, Date.now() + minutes * 60 * 1000);
}

function accountAgeDays(user) {
  return (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24);
}

module.exports = {
  trackJoin,
  isLocked,
  setLockdown,
  accountAgeDays,
};
