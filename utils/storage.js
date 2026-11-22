const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJSON(filename, fallback = {}) {
  ensureDataDir();
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filename, fallback);
      return structuredClone(fallback);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error(`[storage] Failed to read ${filename}:`, err.message);
    return structuredClone(fallback);
  }
}

function writeJSON(filename, data) {
  ensureDataDir();
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[storage] Failed to write ${filename}:`, err.message);
  }
}

module.exports = { readJSON, writeJSON, dataDir };
