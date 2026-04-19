import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file) {
  ensureDir();
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}

function writeJSON(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function getUser(stravaId) {
  const users = readJSON(USERS_FILE);
  return users[String(stravaId)] || null;
}

export function getUserById(id) {
  const users = readJSON(USERS_FILE);
  return Object.values(users).find(u => u.id === id) || null;
}

export function saveUser(athlete, tokens) {
  const users = readJSON(USERS_FILE);
  const key = String(athlete.id);
  const existing = users[key];
  users[key] = {
    id: existing ? existing.id : Date.now(),
    strava_id: athlete.id,
    strava_username: athlete.username,
    strava_firstname: athlete.firstname,
    strava_lastname: athlete.lastname,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: tokens.expires_at,
    unit_preference: existing?.unit_preference || 'metric',
    sensitive_mode: existing?.sensitive_mode || 0,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  writeJSON(USERS_FILE, users);
  return users[key];
}

export function updateUser(stravaId, updates) {
  const users = readJSON(USERS_FILE);
  const key = String(stravaId);
  if (users[key]) {
    Object.assign(users[key], updates, { updated_at: new Date().toISOString() });
    writeJSON(USERS_FILE, users);
  }
  return users[key];
}

export function deleteUser(stravaId) {
  const users = readJSON(USERS_FILE);
  delete users[String(stravaId)];
  writeJSON(USERS_FILE, users);

  // Clean up all data files for this user
  const patterns = [
    `activities_${stravaId}.json`,
    `metrics_${stravaId}.json`,
    `result_${stravaId}.json`,
  ];
  for (const filename of patterns) {
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      try { fs.unlinkSync(filepath); } catch (e) { console.error('Failed to delete:', filepath, e); }
    }
  }
}
