const recentJoins = new Map(); // guildId -> [{ id, tag, joinedAt }]

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[0-9_\.\-\s]/g, '')
    .slice(0, 12);
}

function trackAndCheck(guildId, member, config) {
  const cfg = config.altDetection || {};
  if (!cfg.enabled) return { flagged: false, reasons: [] };

  const reasons = [];
  const now = Date.now();
  const ageDays = (now - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);

  if (cfg.minAccountAgeDays && ageDays < cfg.minAccountAgeDays) {
    reasons.push(`Account only ${ageDays.toFixed(1)} days old`);
  }

  if (!recentJoins.has(guildId)) recentJoins.set(guildId, []);
  const list = recentJoins.get(guildId);

  // Similar name to recent joiners
  if (cfg.similarNameCheck) {
    const norm = normalizeName(member.user.username);
    if (norm.length >= 4) {
      for (const prev of list) {
        const prevNorm = normalizeName(prev.tag);
        if (prevNorm && (norm.includes(prevNorm) || prevNorm.includes(norm) || levenshtein(norm, prevNorm) <= 2)) {
          reasons.push(`Similar name to recent join: ${prev.tag}`);
          break;
        }
      }
    }
  }

  list.push({ id: member.id, tag: member.user.username, joinedAt: now });
  // Keep last 30 minutes / 40 entries
  const cutoff = now - 30 * 60 * 1000;
  while (list.length > 40 || (list.length && list[0].joinedAt < cutoff)) list.shift();

  return {
    flagged: reasons.length > 0,
    reasons,
    ageDays,
  };
}

function levenshtein(a, b) {
  if (a.length < b.length) return levenshtein(b, a);
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const cur = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      cur.push(Math.min(cur[j] + 1, prev[j + 1] + 1, prev[j] + cost));
    }
    prev = cur;
  }
  return prev[b.length];
}

module.exports = { trackAndCheck };
