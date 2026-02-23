const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");
const os = require("os");
const express = require("express");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT || 3000);
const HOST = String(process.env.HOST || "0.0.0.0");
const MAX_PLAYERS = 3;
const HUNGER_MAX = 5;
const DEFAULT_ROOM_ID = "trpg-room-1";
const STATE_FILE = path.resolve(__dirname, "realtime_state.json");
const STAT_KEYS = ["hp", "str", "dex", "int", "plasmaPower", "cha", "pool"];
const ITEM_TYPES = ["consumable", "item"];
const DISTANCE_KEYS = ["very_close", "close", "far", "very_far"];
const ENCOUNTER_MODES = ["single", "swarm", "per_player"];
const ATTACK_TYPES = ["physical", "plasma", "item"];
const DICE_TEXTURE_STYLES = ["clean", "grain", "worn", "metal"];
const DICE_ROLL_DURATION_MIN_MS = 700;
const DICE_ROLL_DURATION_MAX_MS = 3500;
const DICE_ROLL_DURATION_DEFAULT_MS = 1500;
const STATUS_EFFECT_KEYS = [
  "stun",
  "silence",
  "half_blind",
  "blind",
  "fracture",
  "weaken",
  "shrink",
  "poison",
  "burn",
  "frost",
  "shock",
  "breathless",
  "bleed",
  "hunger",
  "giant",
  "focus"
];
const INJURY_PART_KEYS = [
  "head",
  "left_arm",
  "chest",
  "right_arm",
  "left_wrist",
  "abdomen",
  "right_wrist",
  "left_hand",
  "left_leg",
  "right_leg",
  "right_hand",
  "left_calf",
  "right_calf",
  "left_foot",
  "right_foot"
];
const SHAPE_OPTIONS = {
  physical: ["physical_all_in", "physical_precise"],
  plasma: ["single", "spread", "place", "stabilize"],
  item: ["item_instant"]
};
const LOG_LIMIT = 300;
const WHISPER_LOG_LIMIT = 300;
const MAX_PLASMA_SKILL_BOOK = 30;
const MAX_AVATAR_DATAURL_LEN = 240000;
const MAX_MONSTER_IMAGE_DATAURL_LEN = 240000;
const MAX_FOLLOWER_IMAGE_DATAURL_LEN = 240000;
const MAX_FOLLOWERS_PER_PC = 12;
const MAX_PARTY_FOLLOWERS = MAX_FOLLOWERS_PER_PC * MAX_PLAYERS;
const PLASMA_CAP_POOL_STEP = 5;
const MAX_THEME_IMAGE_DATAURL_LEN = 780000;
const INVITE_QUERY_KEY = "invite";
const INVITE_COOKIE_NAME = "trpg_invite";
const INVITE_COOKIE_TTL_SEC = 60 * 60 * 24 * 30;
const INVITE_TOKEN_FILE = path.resolve(__dirname, "invite_token.txt");
const BACKUP_DIR = path.resolve(__dirname, "backups");
const BACKUP_FILE_PREFIX = "realtime_state";
const BACKUP_LATEST_FILE = path.join(BACKUP_DIR, `${BACKUP_FILE_PREFIX}.latest.json`);
const BACKUP_MAX_FILES = (() => {
  const n = Number(process.env.STATE_BACKUP_MAX);
  if(!Number.isFinite(n)) return 40;
  return Math.max(3, Math.min(200, Math.floor(n)));
})();
const BACKUP_MIN_INTERVAL_MS = (() => {
  const n = Number(process.env.STATE_BACKUP_MIN_INTERVAL_MS);
  if(!Number.isFinite(n)) return 1000 * 60 * 5;
  return Math.max(15000, Math.min(1000 * 60 * 60 * 24, Math.floor(n)));
})();

function normalizeInviteToken(raw){
  const token = String(raw || "").trim();
  return /^[A-Za-z0-9_-]{16,200}$/.test(token) ? token : "";
}

function generateInviteToken(){
  return crypto.randomBytes(24).toString("base64url");
}

function loadOrCreateInviteToken(){
  const envToken = normalizeInviteToken(process.env.INVITE_TOKEN || "");
  if(envToken) return envToken;

  try{
    const fromFile = normalizeInviteToken(fs.readFileSync(INVITE_TOKEN_FILE, "utf8"));
    if(fromFile) return fromFile;
  }catch(_err){
    /* ignore read errors */
  }

  const created = generateInviteToken();
  try{
    fs.writeFileSync(INVITE_TOKEN_FILE, `${created}\n`, "utf8");
  }catch(_err){
    /* ignore write errors */
  }
  return created;
}

const INVITE_TOKEN = loadOrCreateInviteToken();

function parseCookieHeader(raw){
  const out = {};
  const src = String(raw || "");
  if(!src) return out;
  for(const part of src.split(";")){
    const idx = part.indexOf("=");
    if(idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if(!key) continue;
    out[key] = value;
  }
  return out;
}

function safeDecodeURIComponentValue(raw){
  try{
    return decodeURIComponent(String(raw || ""));
  }catch(_err){
    return String(raw || "");
  }
}

function getFirstQueryValue(raw){
  if(Array.isArray(raw)) return String(raw[0] || "");
  return String(raw || "");
}

function isInviteTokenMatch(raw){
  const token = normalizeInviteToken(raw);
  if(!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(INVITE_TOKEN);
  if(a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function setInviteCookie(res){
  res.setHeader(
    "Set-Cookie",
    `${INVITE_COOKIE_NAME}=${encodeURIComponent(INVITE_TOKEN)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${INVITE_COOKIE_TTL_SEC}`
  );
}

function getRequestInviteToken(req){
  const queryToken = normalizeInviteToken(getFirstQueryValue(req && req.query ? req.query[INVITE_QUERY_KEY] : ""));
  const cookies = parseCookieHeader(req && req.headers ? req.headers.cookie : "");
  const cookieRaw = cookies[INVITE_COOKIE_NAME] ? safeDecodeURIComponentValue(cookies[INVITE_COOKIE_NAME]) : "";
  const cookieToken = normalizeInviteToken(cookieRaw);
  return { queryToken, cookieToken };
}

function buildPathWithoutInvite(req){
  const params = new URLSearchParams();
  const query = req && req.query && typeof req.query === "object" ? req.query : {};
  for(const [key, rawValue] of Object.entries(query)){
    if(key === INVITE_QUERY_KEY) continue;
    if(Array.isArray(rawValue)){
      for(const value of rawValue){
        params.append(key, String(value ?? ""));
      }
      continue;
    }
    if(rawValue === undefined) continue;
    params.append(key, String(rawValue));
  }
  const nextQuery = params.toString();
  const nextPath = req && req.path ? req.path : "/";
  return nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
}

function getSocketInviteToken(socket){
  const authToken = normalizeInviteToken(socket && socket.handshake && socket.handshake.auth
    ? socket.handshake.auth.inviteToken
    : "");
  const queryToken = normalizeInviteToken(getFirstQueryValue(socket && socket.handshake && socket.handshake.query
    ? socket.handshake.query[INVITE_QUERY_KEY]
    : ""));
  const cookies = parseCookieHeader(socket && socket.handshake && socket.handshake.headers
    ? socket.handshake.headers.cookie
    : "");
  const cookieRaw = cookies[INVITE_COOKIE_NAME] ? safeDecodeURIComponentValue(cookies[INVITE_COOKIE_NAME]) : "";
  const cookieToken = normalizeInviteToken(cookieRaw);
  return authToken || queryToken || cookieToken;
}

function getLocalIpv4Addresses(){
  const interfaces = os.networkInterfaces();
  const out = [];
  for(const records of Object.values(interfaces)){
    for(const info of (records || [])){
      if(!info) continue;
      if(info.family !== "IPv4") continue;
      if(info.internal) continue;
      if(!info.address) continue;
      out.push(info.address);
    }
  }
  return [...new Set(out)];
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 10 * 1024 * 1024
});

function toInt(v){
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function isPlasmaType(type){
  return normalizeAttackType(type) === "plasma";
}

function getStatStepFromState(state){
  return clamp(toInt(state && state.k && state.k.statStep ? state.k.statStep : 5), 1, 99);
}

function getPlasmaMaxFromPoolStat(poolValueRaw, kState = null){
  const cfg = Object.assign(defaultK(), (kState && typeof kState === "object") ? kState : {});
  const poolStat = clamp(toInt(poolValueRaw), 1, 99999);
  const poolBase = clamp(toInt(cfg.poolBase), 1, 99999);
  const poolStart = clamp(toInt(cfg.poolStart), 1, 99999);
  const poolStep = clamp(toInt(cfg.poolStep), 1, 99999);
  const poolGain = clamp(toInt(cfg.poolGain), 1, 99999);
  if(poolStat <= poolBase) return poolStat;
  const bonusSteps = Math.max(0, Math.floor((poolStat - poolStart) / poolStep));
  return clamp(poolBase + (bonusSteps * poolGain), 1, 99999);
}

function getIntCapBonus(pc, statStep = 5){
  void statStep;
  const max = clamp(toInt(pc && (pc.plasmaMax || getPlasmaMaxFromPoolStat(pc.pool))), 1, 99999);
  return max;
}

function getEffectivePlasmaCap(pc, statStep = 5){
  void statStep;
  const max = clamp(toInt(pc && (pc.plasmaMax || getPlasmaMaxFromPoolStat(pc.pool))), 1, 99999);
  return max;
}

function safeText(value, maxLen = 80){
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, maxLen);
}

function sanitizeStatusEffects(list){
  const src = Array.isArray(list) ? list : [];
  const out = [];
  for(const item of src){
    const key = safeText(item || "", 40);
    if(!STATUS_EFFECT_KEYS.includes(key)) continue;
    if(out.includes(key)) continue;
    out.push(key);
    if(out.length >= STATUS_EFFECT_KEYS.length) break;
  }
  return out;
}

function createEmptyInjuryMap(){
  const out = {};
  for(const key of INJURY_PART_KEYS){
    out[key] = 0;
  }
  return out;
}

function sanitizeInjuryMap(raw){
  const source = raw && typeof raw === "object" ? raw : {};
  const out = createEmptyInjuryMap();
  for(const key of INJURY_PART_KEYS){
    out[key] = clamp(toInt(source[key]), 0, 4);
  }
  return out;
}

function getSocketClientIp(socket){
  const headers = (socket && socket.handshake && socket.handshake.headers) ? socket.handshake.headers : {};
  const forwarded = Array.isArray(headers["x-forwarded-for"])
    ? headers["x-forwarded-for"][0]
    : String(headers["x-forwarded-for"] || "");
  const firstForwarded = forwarded.split(",")[0].trim();
  let ip = firstForwarded || String((socket && socket.handshake && socket.handshake.address) || "");
  if(ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip || "unknown";
}

function getSocketClientKey(socket){
  const headers = (socket && socket.handshake && socket.handshake.headers) ? socket.handshake.headers : {};
  const ua = String(headers["user-agent"] || "").slice(0, 200);
  const ip = getSocketClientIp(socket);
  return crypto.createHash("sha1").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

function safeMemo(value, maxLen = 2000){
  return String(value ?? "").replace(/\r\n/g, "\n").slice(0, maxLen);
}

function normalizeHexColor(raw, fallback = "#000000"){
  const value = String(raw || "").trim();
  if(/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if(/^#[0-9a-fA-F]{3}$/.test(value)){
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return String(fallback || "#000000").toLowerCase();
}

function sanitizeAvatarDataUrl(value){
  const raw = String(value ?? "").trim();
  if(!raw) return "";
  if(!raw.startsWith("data:image/")) return "";
  if(raw.length > MAX_AVATAR_DATAURL_LEN) return "";
  return raw;
}

function sanitizeThemeImageDataUrl(value){
  const raw = String(value ?? "").trim();
  if(!raw) return "";
  if(!raw.startsWith("data:image/")) return "";
  if(raw.length > MAX_THEME_IMAGE_DATAURL_LEN) return "";
  return raw;
}

function sanitizeMonsterImageDataUrl(value){
  const raw = String(value ?? "").trim();
  if(!raw) return "";
  if(!raw.startsWith("data:image/")) return "";
  if(raw.length > MAX_MONSTER_IMAGE_DATAURL_LEN) return "";
  return raw;
}

function sanitizeFollowerImageDataUrl(value){
  const raw = String(value ?? "").trim();
  if(!raw) return "";
  if(!raw.startsWith("data:image/")) return "";
  if(raw.length > MAX_FOLLOWER_IMAGE_DATAURL_LEN) return "";
  return raw;
}

function normalizeAttackType(type){
  const value = String(type || "");
  return ATTACK_TYPES.includes(value) ? value : "plasma";
}

function normalizeShapeForType(type, shape){
  const attackType = normalizeAttackType(type);
  const options = SHAPE_OPTIONS[attackType] || [];
  const shapeValue = String(shape || "");
  if(options.includes(shapeValue)) return shapeValue;
  return options[0] || "";
}

function normalizeIntensity(raw){
  const value = String(raw || "");
  if(["high", "mid", "low"].includes(value)) return value;
  return "mid";
}

function normalizePlasmaLayer(layer, index = 0){
  const raw = layer && typeof layer === "object" ? layer : {};
  const intensity = normalizeIntensity(raw.intensity);
  let use = clamp(toInt(raw.use), 0, 99);
  if(intensity === "low") use = 0;
  else if(intensity === "mid") use = 1;
  else use = clamp(use || 1, 1, 99);
  return {
    id: safeText(raw.id || makeId("layer"), 60) || `layer_${index + 1}`,
    shape: normalizeShapeForType("plasma", raw.shape || "single"),
    intensity,
    use
  };
}

function normalizePlasmaSkillEntry(entry, index = 0){
  const raw = entry && typeof entry === "object" ? entry : {};
  const name = safeText(raw.name || `플라즈마 기술 ${index + 1}`, 40);
  const rangeKind = (String(raw.rangeKind || "") === "far")
    ? "far"
    : ((String(raw.distance || "") === "far" || String(raw.distance || "") === "very_far") ? "far" : "close");
  let skillKind = "strike";
  if(String(raw.skillKind || "") === "aoe") skillKind = "aoe";
  else if(String(raw.skillKind || "") === "buff") skillKind = "buff";
  else if(String(raw.shape || "") === "spread") skillKind = "aoe";
  else if(["place", "stabilize"].includes(String(raw.shape || ""))) skillKind = "buff";
  return {
    id: safeText(raw.id || makeId("pskill"), 60) || `pskill_${index + 1}`,
    name: name || `플라즈마 기술 ${index + 1}`,
    rangeKind,
    skillKind,
    baseCost: clamp(toInt(raw.baseCost || raw.multi || 1), 1, 99),
    desc: safeText(raw.desc || raw.description || raw.note || "", 180),
    level: clamp(toInt(raw.level || 1), 1, 3),
    buffHit: clamp(toInt(raw.buffHit), 0, 99),
    buffPow: clamp(toInt(raw.buffPow), 0, 99),
    hitBonus: clamp(toInt(raw.hitBonus), -99, 99),
    powBonus: clamp(toInt(raw.powBonus), -99, 99)
  };
}

function normalizePlasmaSkillBook(book){
  const src = Array.isArray(book) ? book : [];
  return src
    .map((entry, index) => normalizePlasmaSkillEntry(entry, index))
    .slice(0, MAX_PLASMA_SKILL_BOOK);
}

function normalizeLogEntry(entry, index = 0){
  const raw = entry && typeof entry === "object" ? entry : {};
  const kind = ["chat", "roll", "system"].includes(String(raw.kind || "")) ? String(raw.kind) : "chat";
  return {
    id: safeText(raw.id || makeId("log"), 60) || `log_${index + 1}`,
    ts: clamp(toInt(raw.ts || Date.now()), 0, 9999999999999),
    kind,
    author: safeText(raw.author || "시스템", 24) || "시스템",
    text: safeText(raw.text || "", 220)
  };
}

function normalizeWhisperEntry(entry, index = 0){
  const raw = entry && typeof entry === "object" ? entry : {};
  const authorRole = String(raw.authorRole || "") === "admin" ? "admin" : "user";
  return {
    id: safeText(raw.id || makeId("whisper"), 60) || `whisper_${index + 1}`,
    ts: clamp(toInt(raw.ts || Date.now()), 0, 9999999999999),
    authorRole,
    userSlot: clamp(toInt(raw.userSlot), 0, MAX_PLAYERS - 1),
    text: safeText(raw.text || "", 220)
  };
}

function makeId(prefix = "id"){
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeItemTemplate(item, index = 0){
  const raw = item && typeof item === "object" ? item : {};
  const name = safeText(raw.name || `아이템${index + 1}`, 40);
  return {
    id: safeText(raw.id || makeId("tpl"), 60),
    name: name || `아이템${index + 1}`,
    type: ITEM_TYPES.includes(raw.type) ? raw.type : "item",
    desc: safeText(raw.desc || "", 120),
    baseQty: clamp(toInt(raw.baseQty || 1), 1, 9999)
  };
}

function normalizeInventoryItem(item, index = 0){
  const raw = item && typeof item === "object" ? item : {};
  const name = safeText(raw.name || `아이템${index + 1}`, 40);
  return {
    id: safeText(raw.id || makeId("inv"), 60),
    templateId: safeText(raw.templateId || "", 60),
    name: name || `아이템${index + 1}`,
    type: ITEM_TYPES.includes(raw.type) ? raw.type : "item",
    desc: safeText(raw.desc || "", 120),
    qty: clamp(toInt(raw.qty || 1), 1, 9999)
  };
}

function addInventoryItemToPc(pc, sourceItem, qty = 1){
  if(!pc || typeof pc !== "object") return false;
  if(!Array.isArray(pc.inventory)) pc.inventory = [];

  const normalized = normalizeInventoryItem(sourceItem, pc.inventory.length);
  const addQty = clamp(toInt(qty || normalized.qty || 1), 1, 99999);
  const existing = pc.inventory.find((it) => (
    safeText(it.templateId || "", 60) === safeText(normalized.templateId || "", 60)
    && safeText(it.name || "", 40) === safeText(normalized.name || "", 40)
    && (ITEM_TYPES.includes(it.type) ? it.type : "item") === normalized.type
    && safeText(it.desc || "", 120) === safeText(normalized.desc || "", 120)
  ));

  if(existing){
    existing.qty = clamp(toInt(existing.qty) + addQty, 1, 99999);
    return true;
  }

  pc.inventory.push(normalizeInventoryItem({
    id: makeId("inv"),
    templateId: normalized.templateId,
    name: normalized.name,
    type: normalized.type,
    desc: normalized.desc,
    qty: addQty
  }, pc.inventory.length));
  return true;
}

function normalizeFollowerTemplate(template, index = 0){
  const raw = template && typeof template === "object" ? template : {};
  const name = safeText(raw.name || `동행 NPC 템플릿 ${index + 1}`, 40);
  const hpMax = clamp(toInt(raw.hpMax || raw.hp || 10), 1, 99999);
  const hpNow = clamp(toInt((raw.hpNow ?? raw.hp) || hpMax), 0, hpMax);
  const plasmaMax = clamp(toInt(raw.plasmaMax || raw.pool || 5), 1, 99999);
  const plasmaNow = clamp(toInt((raw.plasmaNow ?? raw.plasma) || plasmaMax), 0, plasmaMax);
  const plasmaCap = clamp(toInt(raw.plasmaCap || Math.min(2, plasmaMax)), 1, plasmaMax);
  const hunger = clamp(toInt(raw.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
  return {
    id: safeText(raw.id || makeId("npctpl"), 60),
    name: name || `동행 NPC 템플릿 ${index + 1}`,
    image: sanitizeFollowerImageDataUrl(raw.image || raw.avatar || ""),
    hpNow,
    hpMax,
    plasmaNow,
    plasmaMax,
    plasmaCap,
    hunger,
    note: safeText(raw.note || "", 120),
    statusEffects: sanitizeStatusEffects(raw.statusEffects),
    injuryMap: sanitizeInjuryMap(raw.injuryMap || raw.injuries || raw.bodyInjury || {})
  };
}

function normalizeFollowerNpc(npc, index = 0){
  const raw = npc && typeof npc === "object" ? npc : {};
  const name = safeText(raw.name || `동행 NPC ${index + 1}`, 40);
  const hpMax = clamp(toInt(raw.hpMax || raw.hp || 10), 1, 99999);
  const hpNow = clamp(toInt((raw.hpNow ?? raw.hp) || hpMax), 0, hpMax);
  const plasmaMax = clamp(toInt(raw.plasmaMax || raw.pool || 5), 1, 99999);
  const plasmaNow = clamp(toInt((raw.plasmaNow ?? raw.plasma) || plasmaMax), 0, plasmaMax);
  const plasmaCap = clamp(toInt(raw.plasmaCap || Math.min(2, plasmaMax)), 1, plasmaMax);
  const hunger = clamp(toInt(raw.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
  return {
    id: safeText(raw.id || makeId("npc"), 60),
    templateId: safeText(raw.templateId || "", 60),
    name: name || `동행 NPC ${index + 1}`,
    image: sanitizeFollowerImageDataUrl(raw.image || raw.avatar || ""),
    hpNow,
    hpMax,
    plasmaNow,
    plasmaMax,
    plasmaCap,
    hunger,
    note: safeText(raw.note || "", 120),
    statusEffects: sanitizeStatusEffects(raw.statusEffects),
    injuryMap: sanitizeInjuryMap(raw.injuryMap || raw.injuries || raw.bodyInjury || {})
  };
}

function normalizeMonsterTemplate(monster, index = 0){
  const raw = monster && typeof monster === "object" ? monster : {};
  const name = safeText(raw.name || `몬스터${index + 1}`, 40);
  const kind = raw.kind === "swarm" ? "swarm" : "single";
  return {
    id: safeText(raw.id || makeId("mon"), 60),
    name: name || `몬스터${index + 1}`,
    image: sanitizeMonsterImageDataUrl(raw.image || raw.avatar || ""),
    kind,
    hp: clamp(toInt(raw.hp || 20), 1, 999999),
    dc: clamp(toInt(raw.dc || 12), 1, 99999),
    eva: clamp(toInt(raw.eva || 0), -999, 999),
    note: safeMemo(raw.note || "", 500)
  };
}

function normalizeActiveMonster(monster, index = 0){
  const raw = monster && typeof monster === "object" ? monster : {};
  const name = safeText(raw.name || `운영몬스터${index + 1}`, 40);
  const hpMax = clamp(toInt(raw.hpMax || raw.hp || 20), 1, 999999);
  const hpNow = clamp(toInt((raw.hpNow ?? raw.hp) || hpMax), 0, hpMax);
  return {
    id: safeText(raw.id || makeId("act"), 60),
    templateId: safeText(raw.templateId || "", 60),
    name: name || `운영몬스터${index + 1}`,
    image: sanitizeMonsterImageDataUrl(raw.image || raw.avatar || ""),
    hpNow,
    hpMax,
    dc: clamp(toInt(raw.dc || 12), 1, 99999),
    eva: clamp(toInt(raw.eva || 0), -999, 999),
    injuryMap: sanitizeInjuryMap(raw.injuryMap || raw.injuries || raw.bodyInjury || {}),
    statusMemo: safeMemo(raw.statusMemo || raw.note || "", 500),
    extraDamage: clamp(toInt(raw.extraDamage || 0), -999, 999),
    hitBonus: clamp(toInt(raw.hitBonus || 0), -99, 99)
  };
}

function defaultEncounter(){
  return {
    mode: "single",
    sharedMonsterId: "",
    swarmCount: 3,
    perPlayerMonsterIds: Array.from({ length: MAX_PLAYERS }, () => "")
  };
}

function normalizeEncounterConfig(raw){
  const encounter = Object.assign(defaultEncounter(), raw || {});
  encounter.mode = ENCOUNTER_MODES.includes(String(encounter.mode || "")) ? String(encounter.mode) : "single";
  encounter.sharedMonsterId = safeText(encounter.sharedMonsterId || "", 60);
  encounter.swarmCount = clamp(toInt(encounter.swarmCount || 3), 1, 999);
  const perIds = Array.isArray(encounter.perPlayerMonsterIds) ? encounter.perPlayerMonsterIds : [];
  while(perIds.length < MAX_PLAYERS) perIds.push("");
  encounter.perPlayerMonsterIds = perIds.slice(0, MAX_PLAYERS).map((id) => safeText(id || "", 60));
  return encounter;
}

function defaultTheme(){
  return {
    bgTop: "#2a1b12",
    bgMid: "#22170f",
    bgBottom: "#1a110b",
    surface: "#f4e7cd",
    text: "#3a241b",
    muted: "#6d4f43",
    accent: "#9b6835",
    brightness: 100,
    imageMode: "texture",
    imageDataUrl: "",
    imageTileW: 1000,
    imageTileH: 1000,
    imageBrightness: 100,
    imageSaturation: 100
  };
}

function defaultDiceAppearance(){
  return {
    bodyColor: "#f3e4be",
    edgeColor: "#5b3a1f",
    textColor: "#2b180b",
    textOutline: "#fcf1d5",
    roughness: 46,
    metalness: 3,
    textureStyle: "clean",
    rollDurationMs: DICE_ROLL_DURATION_DEFAULT_MS,
    rollPower: 150
  };
}

function sanitizeDiceAppearance(raw){
  const next = Object.assign(defaultDiceAppearance(), raw && typeof raw === "object" ? raw : {});
  next.bodyColor = normalizeHexColor(next.bodyColor, "#f3e4be");
  next.edgeColor = normalizeHexColor(next.edgeColor, "#5b3a1f");
  next.textColor = normalizeHexColor(next.textColor, "#2b180b");
  next.textOutline = normalizeHexColor(next.textOutline, "#fcf1d5");
  next.roughness = clamp(toInt(next.roughness || 46), 0, 100);
  next.metalness = clamp(toInt(next.metalness || 3), 0, 100);
  next.textureStyle = DICE_TEXTURE_STYLES.includes(String(next.textureStyle || ""))
    ? String(next.textureStyle)
    : "clean";
  next.rollDurationMs = clamp(
    toInt(next.rollDurationMs || DICE_ROLL_DURATION_DEFAULT_MS),
    DICE_ROLL_DURATION_MIN_MS,
    DICE_ROLL_DURATION_MAX_MS
  );
  next.rollPower = clamp(toInt(next.rollPower || 150), 70, 250);
  return next;
}

function sanitizeTheme(raw){
  const next = Object.assign(defaultTheme(), raw && typeof raw === "object" ? raw : {});
  next.bgTop = normalizeHexColor(next.bgTop, "#2a1b12");
  next.bgMid = normalizeHexColor(next.bgMid, "#22170f");
  next.bgBottom = normalizeHexColor(next.bgBottom, "#1a110b");
  next.surface = normalizeHexColor(next.surface, "#f4e7cd");
  next.text = normalizeHexColor(next.text, "#3a241b");
  next.muted = normalizeHexColor(next.muted, "#6d4f43");
  next.accent = normalizeHexColor(next.accent, "#9b6835");
  next.brightness = clamp(toInt(next.brightness || 100), 60, 120);
  next.imageMode = String(next.imageMode || "texture") === "background" ? "background" : "texture";
  next.imageDataUrl = sanitizeThemeImageDataUrl(next.imageDataUrl);
  let tileW = clamp(toInt(next.imageTileW || 1000), 80, 4096);
  let tileH = clamp(toInt(next.imageTileH || 1000), 80, 4096);
  if(tileW === 320 && tileH === 320){
    tileW = 1000;
    tileH = 1000;
  }
  next.imageTileW = tileW;
  next.imageTileH = tileH;
  next.imageBrightness = clamp(toInt(next.imageBrightness || 100), 40, 180);
  next.imageSaturation = clamp(toInt(next.imageSaturation || 100), 0, 200);
  return next;
}

function defaultK(){
  return {
    multiHit: 2,
    highHit: 1,
    lowHit: 1,
    singlePow: 1,
    spreadPow: 1,
    highPow: 2,
    lowPow: 1,
    intReduce: 1,
    statStep: 5,
    traitStep: 5,
    phyHitTrait: 0,
    plasmaHitTrait: 0,
    plasmaPowTrait: 1,
    itemHitTrait: 0,
    baseStrStep: 5,
    baseDexStep: 5,
    baseIntStep: 5,
    baseChaStep: 5,
    basePhyHitStr: 1,
    basePhyHitDex: 1,
    basePlasmaHitDex: 1,
    basePlasmaHitInt: 1,
    basePlasmaHitMode: "max",
    baseItemHitDex: 1,
    baseItemHitCha: 0,
    basePhyPowStr: 1,
    basePlasmaPowInt: 1,
    basePlasmaPowDex: 1,
    placePow: 1,
    chargePow: 1,
    strHitStep: 3,
    strHitGain: 1,
    dexDcStep: 4,
    dexDcGain: 1,
    dexHitStep: 10,
    dexHitGain: 1,
    intHitStep: 4,
    intHitGain: 1,
    intEffStep: 4,
    intEffChancePct: 10,
    plasmaPowStep: 3,
    plasmaPowGain: 2,
    closeStrPowStep: 3,
    closeStrPowGain: 1,
    closeDexPowStep: 5,
    closeDexPowGain: 1,
    farPlasmaPowStep: 3,
    farPlasmaPowGain: 1,
    farIntPowStep: 5,
    farIntPowGain: 1,
    poolBase: 5,
    poolStart: 4,
    poolStep: 4,
    poolGain: 1,
    chaGuide: "NPC 이벤트/위압 판정은 GM 재량 적용"
  };
}

function defaultPC(index = 0){
  const pool = 5;
  const plasmaMax = getPlasmaMaxFromPoolStat(pool);
  return {
    hp: 20,
    str: 5,
    dex: 5,
    int: 5,
    plasmaPower: 5,
    cha: 5,
    pool,
    gold: 0,
    plasmaNow: plasmaMax,
    plasmaMax,
    plasmaCap: 1,
    alwaysHit: 0,
    alwaysPow: 0,
    skipTurns: 0,
    skillPoints: 0,
    type: "plasma",
    distance: "close",
    plasmaRangeKind: "close",
    activePlasmaSkillId: "",
    shape: "single",
    intensity: "mid",
    multi: 1,
    name: `User${index + 1}`,
    avatar: "",
    statusEffects: [],
    hunger: HUNGER_MAX,
    injuryMap: createEmptyInjuryMap(),
    followers: [],
    inventory: [],
    memo: "",
    plasmaLayers: [],
    plasmaSkillBook: [],
    plasmaSkillBookUpdatedAt: 0
  };
}

function defaultState(){
  return {
    k: defaultK(),
    pcs: Array.from({ length: MAX_PLAYERS }, (_, i) => defaultPC(i)),
    partyFollowers: [],
    itemTemplates: [],
    npcTemplates: [],
    monsterTemplates: [],
    activeMonsters: [],
    publishedActiveMonsters: [],
    logs: [],
    encounter: defaultEncounter(),
    publishedEncounter: defaultEncounter(),
    activePc: 0,
    syncVersion: 0,
    dc: 12,
    enemyEva: 0,
    showDcToUsers: true,
    theme: defaultTheme(),
    diceAppearance: defaultDiceAppearance()
  };
}

function normalizeRoomId(raw){
  const roomId = String(raw || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
  return roomId || DEFAULT_ROOM_ID;
}

function sanitizeState(raw){
  const source = raw && typeof raw === "object" ? raw : {};
  const state = Object.assign(defaultState(), source);
  state.k = Object.assign(defaultK(), state.k || {});
  state.theme = sanitizeTheme(state.theme || {});
  state.diceAppearance = sanitizeDiceAppearance(state.diceAppearance || {});
  const statStep = getStatStepFromState(state);
  const rawPartyFollowers = Array.isArray(state.partyFollowers) ? state.partyFollowers : [];
  state.itemTemplates = (Array.isArray(state.itemTemplates) ? state.itemTemplates : [])
    .map((item, idx) => normalizeItemTemplate(item, idx));
  state.npcTemplates = (Array.isArray(state.npcTemplates) ? state.npcTemplates : [])
    .map((template, idx) => normalizeFollowerTemplate(template, idx));
  state.monsterTemplates = (Array.isArray(state.monsterTemplates) ? state.monsterTemplates : [])
    .map((monster, idx) => normalizeMonsterTemplate(monster, idx));
  state.activeMonsters = (Array.isArray(state.activeMonsters) ? state.activeMonsters : [])
    .map((monster, idx) => normalizeActiveMonster(monster, idx));
  state.publishedActiveMonsters = (Array.isArray(state.publishedActiveMonsters) ? state.publishedActiveMonsters : [])
    .map((monster, idx) => normalizeActiveMonster(monster, idx));
  state.logs = (Array.isArray(state.logs) ? state.logs : [])
    .map((entry, idx) => normalizeLogEntry(entry, idx))
    .slice(-LOG_LIMIT);
  state.encounter = normalizeEncounterConfig(state.encounter || {});
  state.publishedEncounter = normalizeEncounterConfig(state.publishedEncounter || {});

  const pcs = Array.isArray(state.pcs) ? state.pcs.slice(0, MAX_PLAYERS) : [];
  while(pcs.length < MAX_PLAYERS) pcs.push(defaultPC(pcs.length));
  const legacyFollowers = [];

  state.pcs = pcs.map((pc, i) => {
    const next = Object.assign(defaultPC(i), pc || {});
    next.hp = clamp(toInt(next.hp), 0, 99999);
    next.str = clamp(toInt(next.str), 0, 99999);
    next.dex = clamp(toInt(next.dex), 0, 99999);
    next.int = clamp(toInt(next.int), 0, 99999);
    next.plasmaPower = clamp(toInt(next.plasmaPower), 0, 99999);
    next.cha = clamp(toInt(next.cha), 0, 99999);
    next.pool = clamp(toInt(next.pool || next.plasmaMax || 5), 1, 99999);
    next.gold = clamp(toInt(next.gold), 0, 999999999);
    next.plasmaMax = getPlasmaMaxFromPoolStat(next.pool, state.k);
    next.plasmaNow = clamp(toInt(next.plasmaNow), 0, next.plasmaMax);
    next.plasmaCap = getEffectivePlasmaCap(next, statStep);
    next.alwaysHit = clamp(toInt(next.alwaysHit), -99, 99);
    next.alwaysPow = clamp(toInt(next.alwaysPow), -99, 99);
    next.skipTurns = clamp(toInt(next.skipTurns), 0, 99);
    next.skillPoints = clamp(toInt(next.skillPoints), 0, 99999);
    next.multi = clamp(toInt(next.multi || 1), 1, getEffectivePlasmaCap(next, statStep));
    next.type = normalizeAttackType(next.type);
    next.distance = DISTANCE_KEYS.includes(String(next.distance || "")) ? String(next.distance) : "close";
    next.plasmaRangeKind = (String(next.plasmaRangeKind || "") === "far") ? "far" : "close";
    next.shape = normalizeShapeForType(next.type, next.shape);
    next.intensity = normalizeIntensity(next.intensity);
    next.name = safeText(next.name || `User${i + 1}`, 24) || `User${i + 1}`;
    next.avatar = sanitizeAvatarDataUrl(next.avatar);
    next.statusEffects = sanitizeStatusEffects(next.statusEffects);
    next.hunger = clamp(toInt(next.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
    next.injuryMap = sanitizeInjuryMap(next.injuryMap || next.injuries || next.bodyInjury || {});
    next.memo = safeMemo(next.memo || "", 2000);
    const layers = Array.isArray(next.plasmaLayers) ? next.plasmaLayers : [];
    next.plasmaLayers = layers.map((layer, layerIdx) => normalizePlasmaLayer(layer, layerIdx)).slice(-20);
    next.plasmaSkillBook = normalizePlasmaSkillBook(next.plasmaSkillBook);
    next.plasmaSkillBookUpdatedAt = clamp(toInt(next.plasmaSkillBookUpdatedAt), 0, 9999999999999);
    next.activePlasmaSkillId = safeText(next.activePlasmaSkillId || "", 60);
    if(next.activePlasmaSkillId && !next.plasmaSkillBook.some((entry) => entry.id === next.activePlasmaSkillId)){
      next.activePlasmaSkillId = "";
    }
    const inv = Array.isArray(next.inventory) ? next.inventory : [];
    next.inventory = inv.map((item, invIdx) => normalizeInventoryItem(item, invIdx));
    const followers = Array.isArray(next.followers) ? next.followers : [];
    next.followers = followers
      .map((npc, npcIdx) => normalizeFollowerNpc(npc, npcIdx))
      .slice(0, MAX_FOLLOWERS_PER_PC);
    legacyFollowers.push(...next.followers);
    next.followers = [];
    return next;
  });

  const normalizedPartyFollowers = rawPartyFollowers
    .map((npc, idx) => normalizeFollowerNpc(npc, idx))
    .slice(0, MAX_PARTY_FOLLOWERS);
  state.partyFollowers = (normalizedPartyFollowers.length > 0 ? normalizedPartyFollowers : legacyFollowers)
    .map((npc, idx) => normalizeFollowerNpc(npc, idx))
    .slice(0, MAX_PARTY_FOLLOWERS);

  state.activePc = clamp(toInt(state.activePc), 0, MAX_PLAYERS - 1);
  state.syncVersion = clamp(toInt(state.syncVersion), 0, 2147483647);
  state.dc = toInt(state.dc ?? 12);
  state.enemyEva = toInt(state.enemyEva ?? 0);
  state.showDcToUsers = state.showDcToUsers !== false;
  return state;
}

function loadPersistedRoomStates(){
  if(!fs.existsSync(STATE_FILE)) return {};

  try{
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const rooms = parsed && typeof parsed === "object" && parsed.rooms && typeof parsed.rooms === "object"
      ? parsed.rooms
      : {};

    const out = {};
    for(const [roomId, roomState] of Object.entries(rooms)){
      out[normalizeRoomId(roomId)] = sanitizeState(roomState);
    }
    return out;
  }catch(_err){
    return {};
  }
}

const rooms = new Map();
for(const [roomId, state] of Object.entries(loadPersistedRoomStates())){
  rooms.set(roomId, { state, clients: new Map(), whispers: [] });
}

let lastBackupAt = 0;
let lastBackupDigest = "";

function formatBackupTimestamp(ts = Date.now()){
  const d = new Date(ts);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yy}${mm}${dd}-${hh}${mi}${ss}`;
}

function pruneBackupFiles(){
  try{
    const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry && entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => new RegExp(`^${BACKUP_FILE_PREFIX}\\.\\d{8}-\\d{6}\\.json$`).test(name))
      .sort();
    if(files.length <= BACKUP_MAX_FILES) return;
    const removeTargets = files.slice(0, files.length - BACKUP_MAX_FILES);
    for(const name of removeTargets){
      try{
        fs.unlinkSync(path.join(BACKUP_DIR, name));
      }catch(_err){
        /* ignore prune errors */
      }
    }
  }catch(_err){
    /* ignore prune errors */
  }
}

function writeStateBackup(serialized, options = {}){
  const force = !!options.force;
  const now = Date.now();
  const digest = crypto.createHash("sha1").update(serialized).digest("hex");

  if(!force){
    if(digest === lastBackupDigest) return;
    if((now - lastBackupAt) < BACKUP_MIN_INTERVAL_MS) return;
  }

  try{
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = formatBackupTimestamp(now);
    const backupFile = path.join(BACKUP_DIR, `${BACKUP_FILE_PREFIX}.${stamp}.json`);
    fs.writeFileSync(backupFile, serialized, "utf8");
    fs.writeFileSync(BACKUP_LATEST_FILE, serialized, "utf8");
    lastBackupAt = now;
    lastBackupDigest = digest;
    pruneBackupFiles();
  }catch(_err){
    /* ignore backup write errors */
  }
}

function persistRoomStatesNow(options = {}){
  const forceBackup = !!options.forceBackup;
  try{
    const data = { rooms: {} };
    for(const [roomId, room] of rooms.entries()){
      data.rooms[roomId] = room.state;
    }
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(STATE_FILE, serialized, "utf8");
    writeStateBackup(serialized, { force: forceBackup });
  }catch(_err){
    // Keep runtime alive even if disk write fails.
  }
}

let persistTimer = null;
function schedulePersist(){
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistRoomStatesNow, 220);
}

persistRoomStatesNow();

function getRoom(roomId){
  if(!rooms.has(roomId)){
    rooms.set(roomId, { state: defaultState(), clients: new Map(), whispers: [] });
  }
  return rooms.get(roomId);
}

function emitRoomState(roomId){
  const room = getRoom(roomId);
  io.to(roomId).emit("room_state", { roomId, state: room.state });
}

function bumpRoomSyncVersion(room){
  if(!room || !room.state) return;
  room.state.syncVersion = clamp(toInt(room.state.syncVersion) + 1, 0, 2147483647);
}

function getActorLabel(room, role, slot){
  if(role === "admin") return "관리자";
  const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
  const pc = room && room.state && room.state.pcs && room.state.pcs[idx] ? room.state.pcs[idx] : defaultPC(idx);
  return safeText(pc.name || `User${idx + 1}`, 24) || `User${idx + 1}`;
}

function pushRoomLog(roomId, entry){
  const room = getRoom(roomId);
  room.state.logs = Array.isArray(room.state.logs) ? room.state.logs : [];
  const nextEntry = normalizeLogEntry(entry, room.state.logs.length);
  room.state.logs.push(nextEntry);
  if(room.state.logs.length > LOG_LIMIT){
    room.state.logs = room.state.logs.slice(-LOG_LIMIT);
  }
  bumpRoomSyncVersion(room);
  io.to(roomId).emit("session_log_append", { roomId, entry: nextEntry });
  schedulePersist();
}

function leaveCurrentRoom(socket){
  const roomId = socket.data.roomId;
  if(!roomId) return;

  const room = rooms.get(roomId);
  if(room){
    room.clients.delete(socket.id);
  }

  socket.leave(roomId);
  socket.data.roomId = null;
  socket.data.role = null;
  socket.data.userSlot = null;

  if(room){
    broadcastPresence(roomId);
  }
}

function broadcastPresence(roomId){
  const room = rooms.get(roomId);
  const clients = room
    ? Array.from(room.clients.entries()).map(([id, c]) => ({
      id,
      role: c.role,
      userSlot: c.userSlot
    }))
    : [];

  io.to(roomId).emit("presence_update", { roomId, clients });
}

function getVisibleWhispersForClient(room, client){
  const list = Array.isArray(room && room.whispers) ? room.whispers : [];
  if(client && client.role === "admin") return list;
  const slot = clamp(toInt(client && client.userSlot), 0, MAX_PLAYERS - 1);
  return list.filter((entry) => clamp(toInt(entry.userSlot), 0, MAX_PLAYERS - 1) === slot);
}

function emitWhisperStateToSocket(socket, roomId){
  if(!socket) return;
  const room = rooms.get(roomId);
  if(!room) return;
  const client = room.clients.get(socket.id) || {
    role: socket.data.role === "admin" ? "admin" : "user",
    userSlot: clamp(toInt(socket.data.userSlot), 0, MAX_PLAYERS - 1)
  };
  socket.emit("whisper_state", { roomId, logs: getVisibleWhispersForClient(room, client) });
}

function emitWhisperStateToRoom(roomId){
  const room = rooms.get(roomId);
  if(!room) return;
  for(const socketId of room.clients.keys()){
    const clientSocket = io.sockets.sockets.get(socketId);
    if(!clientSocket) continue;
    emitWhisperStateToSocket(clientSocket, roomId);
  }
}

function pushWhisper(roomId, entry){
  const room = getRoom(roomId);
  room.whispers = Array.isArray(room.whispers) ? room.whispers : [];
  room.whispers.push(normalizeWhisperEntry(entry, room.whispers.length));
  if(room.whispers.length > WHISPER_LOG_LIMIT){
    room.whispers = room.whispers.slice(-WHISPER_LOG_LIMIT);
  }
  emitWhisperStateToRoom(roomId);
}

function joinRoom(socket, payload){
  const roomId = normalizeRoomId(payload && payload.roomId);
  const role = (payload && payload.role) === "admin" ? "admin" : "user";
  const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);

  if(socket.data.roomId && socket.data.roomId !== roomId){
    leaveCurrentRoom(socket);
  }

  const room = getRoom(roomId);
  socket.join(roomId);
  socket.data.roomId = roomId;
  socket.data.role = role;
  socket.data.userSlot = userSlot;
  room.clients.set(socket.id, { role, userSlot });

  socket.emit("room_state", { roomId, state: room.state });
  broadcastPresence(roomId);

  const roleText = role === "admin" ? "관리자" : `User${userSlot + 1}`;
  socket.emit("server_notice", { level: "good", message: `${roomId} 입장 완료 (${roleText})` });
  socket.emit("client_meta", { clientKey: getSocketClientKey(socket) });
  emitWhisperStateToSocket(socket, roomId);
}

io.use((socket, next) => {
  const inviteToken = getSocketInviteToken(socket);
  if(!isInviteTokenMatch(inviteToken)){
    next(new Error("INVITE_REQUIRED"));
    return;
  }
  next();
});

io.on("connection", (socket) => {
  socket.on("join_room", (payload) => {
    joinRoom(socket, payload);
  });

  socket.on("user_spend_point", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const statKey = String(payload && payload.statKey ? payload.statKey : "");

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }

    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 포인트를 사용할 수 있습니다." });
      return;
    }

    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯만 분배할 수 있습니다." });
      return;
    }

    if(!STAT_KEYS.includes(statKey)){
      socket.emit("server_notice", { level: "bad", message: "잘못된 스탯입니다." });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      return;
    }

    if(toInt(pc.skillPoints) <= 0){
      socket.emit("server_notice", { level: "warn", message: "남은 포인트가 없습니다." });
      return;
    }

    pc.skillPoints = clamp(toInt(pc.skillPoints) - 1, 0, 99999);
    pc[statKey] = clamp(toInt(pc[statKey]) + 1, 0, 99999);
    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("user_rename_self", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const name = safeText(payload && payload.name ? payload.name : "", 24);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 이름 변경이 가능합니다." });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯만 변경할 수 있습니다." });
      return;
    }
    if(!name){
      socket.emit("server_notice", { level: "warn", message: "이름을 입력해주세요." });
      return;
    }

    const room = getRoom(roomId);
    if(!room.state.pcs[userSlot]){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      return;
    }

    room.state.pcs[userSlot].name = name;
    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("user_update_memo", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const memo = safeMemo(payload && payload.memo ? payload.memo : "", 2000);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 메모를 수정할 수 있습니다." });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯 메모만 수정할 수 있습니다." });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      return;
    }
    pc.memo = memo;
    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("user_update_action_state", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const rawActionState = payload && payload.actionState && typeof payload.actionState === "object"
      ? payload.actionState
      : {};

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 행동 설정을 수정할 수 있습니다." });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯 행동만 수정할 수 있습니다." });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      return;
    }

    const nextType = normalizeAttackType(rawActionState.type || pc.type);
    const nextDistance = DISTANCE_KEYS.includes(String(rawActionState.distance || pc.distance || ""))
      ? String(rawActionState.distance || pc.distance)
      : "close";
    const nextPlasmaRangeKind = (String(rawActionState.plasmaRangeKind || pc.plasmaRangeKind || "") === "far")
      ? "far"
      : "close";
    const nextShape = normalizeShapeForType(nextType, rawActionState.shape || pc.shape);
    const nextIntensity = normalizeIntensity(rawActionState.intensity || pc.intensity);
    const cap = getEffectivePlasmaCap(pc, getStatStepFromState(room.state));
    const maxMulti = nextType === "plasma" ? cap : 1;
    const nextMulti = clamp(toInt(rawActionState.multi || pc.multi || 1), 1, maxMulti);
    const nextLayers = (Array.isArray(rawActionState.plasmaLayers) ? rawActionState.plasmaLayers : [])
      .map((layer, layerIdx) => normalizePlasmaLayer(layer, layerIdx))
      .slice(-20);
    const nextSkillBook = normalizePlasmaSkillBook(rawActionState.plasmaSkillBook || pc.plasmaSkillBook);
    const nextActivePlasmaSkillId = safeText(rawActionState.activePlasmaSkillId || pc.activePlasmaSkillId || "", 60);

    pc.type = nextType;
    pc.distance = nextDistance;
    pc.plasmaRangeKind = nextPlasmaRangeKind;
    pc.shape = nextShape;
    pc.intensity = nextIntensity;
    pc.multi = nextMulti;
    pc.plasmaLayers = nextType === "plasma" ? nextLayers : [];
    pc.plasmaSkillBook = nextSkillBook;
    pc.plasmaSkillBookUpdatedAt = Date.now();
    pc.activePlasmaSkillId = nextActivePlasmaSkillId;
    if(pc.activePlasmaSkillId && !pc.plasmaSkillBook.some((entry) => entry.id === pc.activePlasmaSkillId)){
      pc.activePlasmaSkillId = "";
    }

    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("user_inventory_action", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const action = safeText(payload && payload.action ? payload.action : "", 20);
    const inventoryId = safeText(payload && payload.inventoryId ? payload.inventoryId : "", 60);
    const targetSlot = clamp(toInt(payload && payload.targetSlot), 0, MAX_PLAYERS - 1);
    const requestedQty = clamp(toInt(payload && payload.qty), 1, 99999);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 인벤토리를 조작할 수 있습니다." });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯만 조작할 수 있습니다." });
      return;
    }
    if(!["consume", "remove", "give"].includes(action)){
      socket.emit("server_notice", { level: "bad", message: "잘못된 인벤토리 동작입니다." });
      return;
    }
    if(!inventoryId){
      socket.emit("server_notice", { level: "bad", message: "아이템 식별자가 비어 있습니다." });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc || !Array.isArray(pc.inventory)){
      socket.emit("server_notice", { level: "bad", message: "인벤토리를 찾을 수 없습니다." });
      return;
    }

    const idx = pc.inventory.findIndex((item) => item.id === inventoryId);
    if(idx < 0){
      socket.emit("server_notice", { level: "warn", message: "대상 아이템이 없습니다." });
      return;
    }

    const item = pc.inventory[idx];
    if(action === "consume"){
      if(item.type !== "consumable"){
        socket.emit("server_notice", { level: "warn", message: "소모품만 사용 가능합니다." });
        return;
      }
      if(toInt(item.qty) > 1) item.qty = clamp(toInt(item.qty) - 1, 1, 99999);
      else pc.inventory.splice(idx, 1);
    }else if(action === "remove"){
      pc.inventory.splice(idx, 1);
    }else if(action === "give"){
      if(targetSlot === userSlot){
        socket.emit("server_notice", { level: "warn", message: "자기 자신에게는 전달할 수 없습니다." });
        return;
      }
      const targetPc = room.state.pcs[targetSlot];
      if(!targetPc || typeof targetPc !== "object"){
        socket.emit("server_notice", { level: "bad", message: "전달 대상 플레이어를 찾을 수 없습니다." });
        return;
      }
      if(!Array.isArray(targetPc.inventory)) targetPc.inventory = [];
      const currentQty = clamp(toInt(item.qty), 1, 99999);
      const moveQty = Math.min(currentQty, requestedQty);
      const moved = addInventoryItemToPc(targetPc, item, moveQty);
      if(!moved){
        socket.emit("server_notice", { level: "bad", message: "아이템 전달에 실패했습니다." });
        return;
      }
      if(currentQty > moveQty){
        item.qty = clamp(currentQty - moveQty, 1, 99999);
      }else{
        pc.inventory.splice(idx, 1);
      }
    }

    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("whisper_to_gm", (payload, ack) => {
    const sendAck = (obj) => {
      if(typeof ack === "function") ack(obj);
    };
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const text = safeText(payload && payload.text ? payload.text : "", 180);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      sendAck({ ok: false, reason: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "플레이어만 GM 귓속말을 보낼 수 있습니다." });
      sendAck({ ok: false, reason: "플레이어만 GM 귓속말을 보낼 수 있습니다." });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯으로만 귓속말을 보낼 수 있습니다." });
      sendAck({ ok: false, reason: "본인 슬롯으로만 귓속말을 보낼 수 있습니다." });
      return;
    }
    if(!text){
      socket.emit("server_notice", { level: "warn", message: "귓속말 내용을 입력해주세요." });
      sendAck({ ok: false, reason: "귓속말 내용을 입력해주세요." });
      return;
    }

    pushWhisper(roomId, {
      id: makeId("whisper"),
      ts: Date.now(),
      authorRole: "user",
      userSlot,
      text
    });
    sendAck({ ok: true });
  });

  socket.on("gm_whisper_reply", (payload, ack) => {
    const sendAck = (obj) => {
      if(typeof ack === "function") ack(obj);
    };
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const text = safeText(payload && payload.text ? payload.text : "", 180);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      sendAck({ ok: false, reason: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "admin"){
      socket.emit("server_notice", { level: "bad", message: "GM 답장은 관리자만 보낼 수 있습니다." });
      sendAck({ ok: false, reason: "GM 답장은 관리자만 보낼 수 있습니다." });
      return;
    }
    if(!text){
      socket.emit("server_notice", { level: "warn", message: "귓속말 내용을 입력해주세요." });
      sendAck({ ok: false, reason: "귓속말 내용을 입력해주세요." });
      return;
    }

    pushWhisper(roomId, {
      id: makeId("whisper"),
      ts: Date.now(),
      authorRole: "admin",
      userSlot,
      text
    });
    sendAck({ ok: true });
  });

  socket.on("user_use_plasma", (payload, ack) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const requestedUse = clamp(toInt(payload && payload.useAmount), 0, 99999);
    const reserveCharge = !!(payload && payload.reserveCharge);
    const sendAck = (obj) => {
      if(typeof ack === "function") ack(obj);
    };

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      sendAck({ ok: false, reason: "방 미입장" });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 플라즈마를 사용할 수 있습니다." });
      sendAck({ ok: false, reason: "유저 전용" });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯만 조작할 수 있습니다." });
      sendAck({ ok: false, reason: "슬롯 불일치" });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      sendAck({ ok: false, reason: "캐릭터 없음" });
      return;
    }
    if(!isPlasmaType(pc.type)){
      sendAck({ ok: true, plasmaNow: toInt(pc.plasmaNow) });
      return;
    }

    const cap = getEffectivePlasmaCap(pc, getStatStepFromState(room.state));
    const maxUse = cap;
    const requested = clamp(requestedUse, 0, maxUse);
    const intValue = clamp(toInt(pc.int), 0, 99999);
    const kCfg = Object.assign(defaultK(), room.state && room.state.k ? room.state.k : {});
    const intEffStep = clamp(toInt(kCfg.intEffStep), 1, 999);
    const intEffChancePct = clamp(toInt(kCfg.intEffChancePct), 0, 100);
    const reductionChance = clamp(Math.floor(intValue / intEffStep) * (intEffChancePct / 100), 0, 0.95);
    const reductionApplied = requested > 0 && Math.random() < reductionChance;
    const useAmount = Math.max(0, requested - (reductionApplied ? 1 : 0));

    if(reserveCharge){
      sendAck({ ok: false, reason: "안정화 리스크는 비활성화되었습니다." });
      return;
    }
    const now = clamp(toInt(pc.plasmaNow), 0, toInt(pc.plasmaMax || 1));
    if(now < useAmount){
      socket.emit("server_notice", { level: "warn", message: "플라즈마가 부족합니다." });
      sendAck({ ok: false, reason: "플라즈마 부족" });
      return;
    }

    pc.plasmaNow = now - useAmount;
    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
    sendAck({
      ok: true,
      plasmaNow: room.state.pcs[userSlot].plasmaNow,
      usedAmount: useAmount,
      reductionApplied
    });
  });

  socket.on("user_consume_skip_turn", (payload, ack) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const userSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const sendAck = (obj) => {
      if(typeof ack === "function") ack(obj);
    };

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      sendAck({ ok: false, reason: "방 미입장" });
      return;
    }
    if(socket.data.role !== "user"){
      socket.emit("server_notice", { level: "bad", message: "유저만 턴 휴식 처리할 수 있습니다." });
      sendAck({ ok: false, reason: "유저 전용" });
      return;
    }
    if(socket.data.userSlot !== userSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯만 조작할 수 있습니다." });
      sendAck({ ok: false, reason: "슬롯 불일치" });
      return;
    }

    const room = getRoom(roomId);
    const pc = room.state.pcs[userSlot];
    if(!pc){
      socket.emit("server_notice", { level: "bad", message: "캐릭터를 찾을 수 없습니다." });
      sendAck({ ok: false, reason: "캐릭터 없음" });
      return;
    }

    if(toInt(pc.skipTurns) <= 0){
      sendAck({ ok: true, skipTurns: 0 });
      return;
    }

    pc.skipTurns = clamp(toInt(pc.skipTurns) - 1, 0, 99);
    bumpRoomSyncVersion(room);
    room.state = sanitizeState(room.state);
    emitRoomState(roomId);
    schedulePersist();
    sendAck({ ok: true, skipTurns: room.state.pcs[userSlot].skipTurns });
  });

  socket.on("chat_send", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const text = safeText(payload && payload.text ? payload.text : "", 180);
    const payloadSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(!text){
      socket.emit("server_notice", { level: "warn", message: "메시지를 입력해주세요." });
      return;
    }

    const room = getRoom(roomId);
    const role = socket.data.role === "admin" ? "admin" : "user";
    if(role === "user" && socket.data.userSlot !== payloadSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯으로만 채팅할 수 있습니다." });
      return;
    }
    const authorSlot = role === "admin" ? clamp(toInt(socket.data.userSlot), 0, MAX_PLAYERS - 1) : payloadSlot;
    const author = getActorLabel(room, role, authorSlot);
    pushRoomLog(roomId, {
      id: makeId("log"),
      ts: Date.now(),
      kind: "chat",
      author,
      text
    });
  });

  socket.on("roll_sync", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const payloadSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);
    const kind = (String(payload && payload.kind || "") === "damage") ? "damage" : "hit";
    const sidesRaw = toInt(payload && payload.sides);
    const sides = [4, 6, 8, 10, 12, 20].includes(sidesRaw) ? sidesRaw : 20;
    const seedRaw = toInt(payload && payload.seed);
    const seed = clamp(seedRaw > 0 ? seedRaw : Math.floor(Math.random() * 2147483646) + 1, 1, 2147483646);
    const syncId = safeText(payload && payload.syncId ? payload.syncId : makeId("rollsync"), 80);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }

    const room = getRoom(roomId);
    const role = socket.data.role === "admin" ? "admin" : "user";
    if(role === "user" && socket.data.userSlot !== payloadSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯 주사위만 굴릴 수 있습니다." });
      return;
    }

    const authorSlot = role === "admin"
      ? clamp(toInt(socket.data.userSlot), 0, MAX_PLAYERS - 1)
      : payloadSlot;
    const actor = getActorLabel(room, role, authorSlot);
    const now = Date.now();
    const startAt = clamp(toInt(payload && payload.startAt ? payload.startAt : now + 30), now + 20, now + 1200);

    io.to(roomId).emit("roll_sync", {
      roomId,
      syncId,
      kind,
      sides,
      seed,
      startAt,
      actor,
      byRole: role,
      userSlot: authorSlot
    });
  });

  socket.on("roll_outcome", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    const text = safeText(payload && payload.text ? payload.text : "", 220);
    const payloadSlot = clamp(toInt(payload && payload.userSlot), 0, MAX_PLAYERS - 1);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(!text){
      socket.emit("server_notice", { level: "warn", message: "판정 로그가 비어 있습니다." });
      return;
    }

    const room = getRoom(roomId);
    const role = socket.data.role === "admin" ? "admin" : "user";
    if(role === "user" && socket.data.userSlot !== payloadSlot){
      socket.emit("server_notice", { level: "bad", message: "본인 슬롯 판정만 기록할 수 있습니다." });
      return;
    }
    const authorSlot = role === "admin" ? clamp(toInt(socket.data.userSlot), 0, MAX_PLAYERS - 1) : payloadSlot;
    const author = getActorLabel(room, role, authorSlot);
    pushRoomLog(roomId, {
      id: makeId("log"),
      ts: Date.now(),
      kind: "roll",
      author,
      text
    });
  });

  socket.on("admin_clear_logs", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);
    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }
    if(socket.data.role !== "admin"){
      socket.emit("server_notice", { level: "bad", message: "로그 클리어는 관리자만 가능합니다." });
      return;
    }

    const room = getRoom(roomId);
    room.state.logs = [];
    bumpRoomSyncVersion(room);
    io.to(roomId).emit("session_logs_clear", { roomId });
    schedulePersist();
  });

  socket.on("admin_update_state", (payload) => {
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : socket.data.roomId);

    if(!socket.data.roomId || socket.data.roomId !== roomId){
      socket.emit("server_notice", { level: "bad", message: "먼저 방에 입장해주세요." });
      return;
    }

    if(socket.data.role !== "admin"){
      socket.emit("server_notice", { level: "bad", message: "상태 변경은 관리자만 가능합니다." });
      return;
    }

    const room = getRoom(roomId);
    const incomingState = sanitizeState(payload && payload.state ? payload.state : room.state);
    const incomingVersion = clamp(toInt(incomingState.syncVersion), 0, 2147483647);
    const currentVersion = clamp(toInt(room.state && room.state.syncVersion), 0, 2147483647);
    if(incomingVersion > 0 && currentVersion > 0 && incomingVersion <= currentVersion){
      socket.emit("room_state", { roomId, state: room.state });
      return;
    }

    // Guard against stale full-state overwrites: keep newer user skillbook snapshots.
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      const currentPc = room.state && room.state.pcs && room.state.pcs[i]
        ? room.state.pcs[i]
        : defaultPC(i);
      const nextPc = incomingState.pcs && incomingState.pcs[i]
        ? incomingState.pcs[i]
        : defaultPC(i);
      const currentSkillTs = clamp(toInt(currentPc.plasmaSkillBookUpdatedAt), 0, 9999999999999);
      const nextSkillTs = clamp(toInt(nextPc.plasmaSkillBookUpdatedAt), 0, 9999999999999);
      if(currentSkillTs > nextSkillTs){
        nextPc.plasmaSkillBook = normalizePlasmaSkillBook(currentPc.plasmaSkillBook);
        nextPc.activePlasmaSkillId = safeText(currentPc.activePlasmaSkillId || "", 60);
        nextPc.plasmaSkillBookUpdatedAt = currentSkillTs;
        incomingState.pcs[i] = nextPc;
      }
    }

    room.state = incomingState;
    emitRoomState(roomId);
    schedulePersist();
  });

  socket.on("disconnect", () => {
    leaveCurrentRoom(socket);
  });
});

app.use((req, res, next) => {
  const { queryToken, cookieToken } = getRequestInviteToken(req);
  const presentedToken = queryToken || cookieToken;
  if(!isInviteTokenMatch(presentedToken)){
    res.status(403).type("text/plain; charset=utf-8").send("초대 링크가 필요합니다.");
    return;
  }
  if(queryToken){
    setInviteCookie(res);
    if((req.method === "GET" || req.method === "HEAD") && Object.prototype.hasOwnProperty.call(req.query || {}, INVITE_QUERY_KEY)){
      const target = buildPathWithoutInvite(req);
      if(target && target !== req.originalUrl){
        res.redirect(302, target);
        return;
      }
    }
  }
  next();
});

app.use(express.static(path.resolve(__dirname)));
app.get("/", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "meranoder_plasma_helper_3pc_d20.html"));
});

server.listen(PORT, HOST, () => {
  const inviteParam = `${INVITE_QUERY_KEY}=${encodeURIComponent(INVITE_TOKEN)}`;
  console.log(`TRPG 실시간 서버 실행: http://localhost:${PORT} (bind ${HOST}:${PORT})`);
  console.log(`[ACCESS] 초대 링크(로컬): http://localhost:${PORT}/?${inviteParam}`);
  const lanAddresses = getLocalIpv4Addresses();
  for(const ip of lanAddresses){
    console.log(`[ACCESS] 초대 링크(LAN): http://${ip}:${PORT}/?${inviteParam}`);
  }
});

process.on("SIGINT", () => {
  persistRoomStatesNow({ forceBackup: true });
  process.exit(0);
});

process.on("SIGTERM", () => {
  persistRoomStatesNow({ forceBackup: true });
  process.exit(0);
});

process.on("exit", () => {
  persistRoomStatesNow({ forceBackup: true });
});
