const $ = (id) => document.getElementById(id);
  const toInt = (v) => Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const parseBooleanFlag = (value) => {
    if(value === true) return true;
    if(value === false || value === null || value === undefined) return false;
    if(typeof value === "number") return value === 1;
    const text = String(value).trim().toLowerCase();
    if(!text) return false;
    return text === "1" || text === "true" || text === "yes" || text === "on";
  };
  const toSeedInt = (v, fallback = 1) => {
    const n = Number(v);
    if(!Number.isFinite(n)) return clamp(toInt(fallback), 1, 2147483646);
    return clamp(Math.floor(Math.abs(n)), 1, 2147483646);
  };
  const createSeededRng = (seedRaw) => {
    let seed = toSeedInt(seedRaw, 1) >>> 0;
    return () => {
      seed += 0x6D2B79F5;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const STORAGE_KEY = "meranoder_trpg_v3_d20_state";
  const STORAGE_SAFE_KEY = "meranoder_trpg_v3_d20_state_safe";
  const ADMIN_SESSION_STORE_KEY = "meranoder_trpg_v3_d20_admin_session";
  const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
  const ADMIN_SESSION_PASSWORD = "215159";
  const MAX_PLAYERS = 3;
  const HUNGER_MAX = 5;
  const PLAYER_BASE_DC = 10;
  const DEFAULT_ROOM_ID = "trpg-room-1";
  const INVITE_QUERY_KEY = "invite";
  const INVITE_TOKEN_STORE_KEY = "meranoder_trpg_invite_token";
  const ACTIVE_MONSTER_FOCUS_ALL = "__all__";
  const MONSTER_TARGET_NONE = -1;
  const MONSTER_PATCH_ALLOWED_KEYS = [
    "name",
    "kind",
    "image",
    "hpNow",
    "hpMax",
    "dc",
    "eva",
    "statusMemo",
    "statusEffects",
    "injuryMap",
    "targetPlayerSlot",
    "targetFollowerId",
    "damageDiceSides",
    "attackHitBonus",
    "extraDamage",
    "dcBonus",
    "dcPublic"
  ];
  const SPENDABLE_STAT_KEYS = ["hp", "str", "dex", "int", "plasmaPower", "cha", "pool"];
  const ADMIN_STAT_KEYS = [...SPENDABLE_STAT_KEYS, "plasmaNow", "alwaysHit", "alwaysPow"];
  const ITEM_TYPES = ["consumable", "item"];
  const DISTANCE_KEYS = ["very_close", "close", "far", "very_far"];
  const ENCOUNTER_MODES = ["single", "swarm", "per_player"];
  const ENCOUNTER_SHARED_PLAYER_SELECTED_ID = "__player_selected__";
  const ATTACK_TYPES = ["physical", "plasma", "item"];
  const SHAPE_OPTIONS = {
    physical: [
      { value: "physical_all_in", label: "혼신" },
      { value: "physical_precise", label: "정밀" }
    ],
    plasma: [
      { value: "single", label: "단일" },
      { value: "spread", label: "범위" },
      { value: "place", label: "잔존" },
      { value: "stabilize", label: "안정화" }
    ],
    item: [
      { value: "item_instant", label: "즉발성" }
    ]
  };
  const LOG_LIMIT = 300;
  const CHAT_RENDER_LIMIT = 160;
  const USER_ACTION_PENDING_TTL_MS = 2500;
  const USER_ACTION_PENDING_OFFLINE_TTL_MS = 1000 * 60 * 30;
  const SKILL_BOOK_TS_MAX = 9999999999999;
  const MAX_PLASMA_SKILL_BOOK = 30;
  const PLASMA_SKILL_LEVEL_MIN = 1;
  const PLASMA_SKILL_LEVEL_MAX = 3;
  const MAX_AVATAR_FILE_BYTES = 8 * 1024 * 1024;
  const MAX_AVATAR_DATAURL_LEN = 240000;
  const MAX_FOLLOWER_IMAGE_FILE_BYTES = 8 * 1024 * 1024;
  const MAX_FOLLOWER_IMAGE_DATAURL_LEN = 240000;
  const MAX_MONSTER_IMAGE_FILE_BYTES = 8 * 1024 * 1024;
  const MAX_MONSTER_IMAGE_DATAURL_LEN = 240000;
  const MAX_FOLLOWERS_PER_PC = 12;
  const MAX_PARTY_FOLLOWERS = MAX_FOLLOWERS_PER_PC * MAX_PLAYERS;
  const PLASMA_CAP_POOL_STEP = 5;
  const MAX_THEME_IMAGE_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_THEME_IMAGE_DATAURL_LEN = 780000;
  const DEFAULT_THEME_IMAGE_PATH = "/NewBaseImage.jpg";
  const DISTANCE_LABEL = {
    very_close: "매우 가까움",
    close: "가까움",
    far: "멀음",
    very_far: "매우 멀음"
  };
  const ENCOUNTER_MODE_LABEL = {
    single: "하나의 몬스터",
    swarm: "몬스터 무리",
    per_player: "플레이어별 몬스터"
  };
  const ENCOUNTER_SHARED_PLAYER_SELECTED_LABEL = "[플레이어 선택 대상(동적)]";
  const STATUS_EFFECTS = [
    { key: "stun", label: "기절" },
    { key: "silence", label: "침묵" },
    { key: "half_blind", label: "반실명" },
    { key: "blind", label: "실명" },
    { key: "fracture", label: "골절" },
    { key: "weaken", label: "나약함" },
    { key: "slow", label: "둔화" },
    { key: "shrink", label: "위축" },
    { key: "poison", label: "중독" },
    { key: "burn", label: "화상" },
    { key: "frost", label: "동상" },
    { key: "shock", label: "감전" },
    { key: "breathless", label: "호흡곤란" },
    { key: "bleed", label: "출혈" },
    { key: "hunger", label: "허기" },
    { key: "giant", label: "거대화" },
    { key: "focus", label: "정신집중" }
  ];
  const STATUS_EFFECT_KEY_SET = new Set(STATUS_EFFECTS.map((item) => item.key));
  const STATUS_EFFECT_BY_KEY = new Map(STATUS_EFFECTS.map((item) => [item.key, item]));
  const InjuryBodyMap = window.InjuryBodyMap || null;
  const KO_SORT_COLLATOR = (typeof Intl !== "undefined" && typeof Intl.Collator === "function")
    ? new Intl.Collator("ko-KR", { sensitivity: "base", numeric: true })
    : null;

  const defaultTheme = () => ({
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
  });

  const DICE_TEXTURE_STYLES = ["clean", "grain", "worn", "metal"];
  const DICE_ROLL_DURATION_MIN_MS = 700;
  const DICE_ROLL_DURATION_MAX_MS = 3500;
  const DICE_ROLL_DURATION_DEFAULT_MS = 1500;

  const defaultDiceAppearance = () => ({
    bodyColor: "#f3e4be",
    edgeColor: "#5b3a1f",
    textColor: "#2b180b",
    textOutline: "#fcf1d5",
    roughness: 46,
    metalness: 3,
    textureStyle: "clean",
    rollDurationMs: DICE_ROLL_DURATION_DEFAULT_MS,
    rollPower: 150
  });

  function escapeXmlAttr(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildFilteredTextureUrl(imageUrlRaw, imageBrightnessRaw = 100, imageSaturationRaw = 100){
    const src = String(imageUrlRaw || "").trim();
    if(!src) return "";
    const bright = (clamp(toInt(imageBrightnessRaw), 40, 180) / 100).toFixed(3);
    const sat = (clamp(toInt(imageSaturationRaw), 0, 200) / 100).toFixed(3);
    const safeSrc = escapeXmlAttr(src);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><filter id="f" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="${sat}"/><feComponentTransfer><feFuncR type="linear" slope="${bright}"/><feFuncG type="linear" slope="${bright}"/><feFuncB type="linear" slope="${bright}"/></feComponentTransfer></filter><image href="${safeSrc}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" filter="url(#f)"/></svg>`;
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }

  function sanitizeThemeImageDataUrl(value){
    const raw = String(value ?? "").trim();
    if(!raw) return "";
    if(!raw.startsWith("data:image/")) return "";
    if(raw.length > MAX_THEME_IMAGE_DATAURL_LEN) return "";
    return raw;
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

  function hexToRgb(hex){
    const safe = normalizeHexColor(hex, "#000000");
    const num = parseInt(safe.slice(1), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b){
    const rr = clamp(Math.round(r), 0, 255).toString(16).padStart(2, "0");
    const gg = clamp(Math.round(g), 0, 255).toString(16).padStart(2, "0");
    const bb = clamp(Math.round(b), 0, 255).toString(16).padStart(2, "0");
    return `#${rr}${gg}${bb}`;
  }

  function mixHex(baseHex, targetHex, weight = 0.5){
    const w = clamp(Number(weight) || 0, 0, 1);
    const base = hexToRgb(baseHex);
    const target = hexToRgb(targetHex);
    return rgbToHex(
      base.r + ((target.r - base.r) * w),
      base.g + ((target.g - base.g) * w),
      base.b + ((target.b - base.b) * w)
    );
  }

  function scaleHex(hex, factor = 1){
    const f = Number(factor) || 1;
    const c = hexToRgb(hex);
    return rgbToHex(c.r * f, c.g * f, c.b * f);
  }

  function rgbaFromHex(hex, alpha){
    const c = hexToRgb(hex);
    const a = clamp(Number(alpha) || 0, 0, 1);
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a.toFixed(3)})`;
  }

  function normalizeTheme(raw){
    const merged = Object.assign(defaultTheme(), raw || {});
    merged.bgTop = normalizeHexColor(merged.bgTop, "#2a1b12");
    merged.bgMid = normalizeHexColor(merged.bgMid, "#22170f");
    merged.bgBottom = normalizeHexColor(merged.bgBottom, "#1a110b");
    merged.surface = normalizeHexColor(merged.surface, "#f4e7cd");
    merged.text = normalizeHexColor(merged.text, "#3a241b");
    merged.muted = normalizeHexColor(merged.muted, "#6d4f43");
    merged.accent = normalizeHexColor(merged.accent, "#9b6835");
    merged.brightness = clamp(toInt(merged.brightness || 100), 60, 120);
    // Theme image mode is fixed to texture-repeat to avoid full-cover image panels.
    merged.imageMode = "texture";
    merged.imageDataUrl = sanitizeThemeImageDataUrl(merged.imageDataUrl);
    let tileW = clamp(toInt(merged.imageTileW || 1000), 80, 4096);
    let tileH = clamp(toInt(merged.imageTileH || 1000), 80, 4096);
    if(tileW === 320 && tileH === 320){
      tileW = 1000;
      tileH = 1000;
    }
    merged.imageTileW = tileW;
    merged.imageTileH = tileH;
    merged.imageBrightness = clamp(toInt(merged.imageBrightness || 100), 40, 180);
    merged.imageSaturation = clamp(toInt(merged.imageSaturation || 100), 0, 200);
    return merged;
  }

  function normalizeDiceAppearance(raw){
    const merged = Object.assign(defaultDiceAppearance(), raw || {});
    merged.bodyColor = normalizeHexColor(merged.bodyColor, "#f3e4be");
    merged.edgeColor = normalizeHexColor(merged.edgeColor, "#5b3a1f");
    merged.textColor = normalizeHexColor(merged.textColor, "#2b180b");
    merged.textOutline = normalizeHexColor(merged.textOutline, "#fcf1d5");
    merged.roughness = clamp(toInt(merged.roughness || 46), 0, 100);
    merged.metalness = clamp(toInt(merged.metalness || 3), 0, 100);
    merged.textureStyle = DICE_TEXTURE_STYLES.includes(String(merged.textureStyle || ""))
      ? String(merged.textureStyle)
      : "clean";
    merged.rollDurationMs = clamp(
      toInt(merged.rollDurationMs || DICE_ROLL_DURATION_DEFAULT_MS),
      DICE_ROLL_DURATION_MIN_MS,
      DICE_ROLL_DURATION_MAX_MS
    );
    merged.rollPower = clamp(toInt(merged.rollPower || 150), 70, 250);
    return merged;
  }

  function updateDiceRoughnessLabel(value){
    const label = $("diceRoughnessValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 0, 100)}%`;
  }

  function updateDiceMetalnessLabel(value){
    const label = $("diceMetalnessValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 0, 100)}%`;
  }

  function updateDiceRollDurationLabel(value){
    const label = $("diceRollDurationValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), DICE_ROLL_DURATION_MIN_MS, DICE_ROLL_DURATION_MAX_MS)}ms`;
  }

  function updateDiceRollPowerLabel(value){
    const label = $("diceRollPowerValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 70, 250)}%`;
  }

  function readDiceAppearanceFromUI(){
    const fallback = normalizeDiceAppearance(state && state.diceAppearance ? state.diceAppearance : defaultDiceAppearance());
    const readValue = (id, fallbackValue) => {
      const el = $(id);
      return el ? String(el.value || "") : String(fallbackValue || "");
    };
    return normalizeDiceAppearance({
      bodyColor: readValue("diceBodyColor", fallback.bodyColor),
      edgeColor: readValue("diceEdgeColor", fallback.edgeColor),
      textColor: readValue("diceTextColor", fallback.textColor),
      textOutline: readValue("diceTextOutlineColor", fallback.textOutline),
      roughness: toInt(readValue("diceRoughness", fallback.roughness)),
      metalness: toInt(readValue("diceMetalness", fallback.metalness)),
      textureStyle: readValue("diceTextureStyle", fallback.textureStyle),
      rollDurationMs: toInt(readValue("diceRollDuration", fallback.rollDurationMs)),
      rollPower: toInt(readValue("diceRollPower", fallback.rollPower))
    });
  }

  function writeDiceAppearanceToUI(raw){
    const appearance = normalizeDiceAppearance(raw);
    const assign = (id, value) => {
      const el = $(id);
      if(el) el.value = value;
    };
    assign("diceBodyColor", appearance.bodyColor);
    assign("diceEdgeColor", appearance.edgeColor);
    assign("diceTextColor", appearance.textColor);
    assign("diceTextOutlineColor", appearance.textOutline);
    assign("diceRoughness", String(appearance.roughness));
    assign("diceMetalness", String(appearance.metalness));
    assign("diceTextureStyle", appearance.textureStyle);
    assign("diceRollDuration", String(appearance.rollDurationMs));
    assign("diceRollPower", String(appearance.rollPower));
    updateDiceRoughnessLabel(appearance.roughness);
    updateDiceMetalnessLabel(appearance.metalness);
    updateDiceRollDurationLabel(appearance.rollDurationMs);
    updateDiceRollPowerLabel(appearance.rollPower);
  }

  function getDiceAppearance(){
    return normalizeDiceAppearance(state && state.diceAppearance ? state.diceAppearance : defaultDiceAppearance());
  }

  function buildThemeCssVars(themeRaw){
    const theme = normalizeTheme(themeRaw);
    const imageUrl = theme.imageDataUrl || DEFAULT_THEME_IMAGE_PATH;
    const filteredImageUrl = buildFilteredTextureUrl(imageUrl, theme.imageBrightness, theme.imageSaturation) || `url("${imageUrl}")`;
    const imageLayer = `${filteredImageUrl} center / ${theme.imageTileW}px ${theme.imageTileH}px repeat`;
    const bright = theme.brightness / 100;
    const surfaceBase = scaleHex(theme.surface, bright);
    const surfaceTop = mixHex(surfaceBase, "#ffffff", 0.14);
    const surfaceMid = scaleHex(surfaceBase, 0.94);
    const surfaceBottom = scaleHex(surfaceBase, 0.84);
    const panelTop = mixHex(surfaceBase, "#ffffff", 0.2);
    const panelBottom = scaleHex(surfaceBase, 0.88);

    const accentTop = mixHex(theme.accent, "#ffffff", 0.08);
    const accentMid = scaleHex(theme.accent, 0.78);
    const accentBottom = scaleHex(theme.accent, 0.62);
    const accentDark = scaleHex(theme.accent, 0.52);
    const accentHeaderTop = scaleHex(theme.accent, 0.64);
    const accentHeaderBottom = scaleHex(theme.accent, 0.42);

    const textSoft = mixHex(theme.text, theme.surface, 0.18);
    const placeholder = mixHex(theme.text, theme.surface, 0.38);
    const border = rgbaFromHex(scaleHex(theme.surface, 0.66), 0.82);
    const borderSoft = rgbaFromHex(scaleHex(theme.surface, 0.58), 0.78);
    const focus = mixHex(theme.accent, "#dca46a", 0.35);

    return {
      "--theme-bg-top": theme.bgTop,
      "--theme-bg-mid": theme.bgMid,
      "--theme-bg-bottom": theme.bgBottom,
      "--theme-header-grad": `linear-gradient(180deg, ${rgbaFromHex(accentHeaderTop, 0.96)}, ${rgbaFromHex(accentHeaderBottom, 0.94)})`,
      "--theme-header-title": mixHex(theme.surface, "#fff7ea", 0.55),
      "--theme-header-sub": mixHex(theme.surface, "#f0dcb9", 0.55),
      "--theme-text-main": theme.text,
      "--theme-text-muted": theme.muted,
      "--theme-text-soft": textSoft,
      "--theme-placeholder": placeholder,
      "--theme-focus": focus,
      "--theme-border": border,
      "--theme-border-soft": borderSoft,
      "--theme-surface-grad": `linear-gradient(180deg, ${rgbaFromHex(surfaceTop, 0.78)} 0%, ${rgbaFromHex(surfaceMid, 0.8)} 62%, ${rgbaFromHex(surfaceBottom, 0.82)} 100%)`,
      "--theme-pill-grad": `linear-gradient(180deg, ${rgbaFromHex(panelTop, 0.76)}, ${rgbaFromHex(panelBottom, 0.74)})`,
      "--theme-input-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#ffffff", 0.16), 0.82)}, ${rgbaFromHex(mixHex(surfaceMid, "#f0e1bf", 0.22), 0.8)})`,
      "--theme-readonly-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#fff4db", 0.18), 0.82)}, ${rgbaFromHex(mixHex(surfaceBottom, "#e8cf9f", 0.22), 0.8)})`,
      "--theme-tab-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#f7e8c7", 0.18), 0.8)}, ${rgbaFromHex(mixHex(surfaceBottom, "#e7c98f", 0.22), 0.78)})`,
      "--theme-tab-active-grad": `linear-gradient(180deg, ${accentTop}, ${accentDark})`,
      "--theme-player-grad": `linear-gradient(180deg, ${rgbaFromHex(surfaceTop, 0.8)}, ${rgbaFromHex(surfaceMid, 0.78)})`,
      "--theme-player-active-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#fff4da", 0.22), 0.84)}, ${rgbaFromHex(mixHex(surfaceBottom, "#efd09a", 0.26), 0.82)})`,
      "--theme-dice-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#f7e2b5", 0.24), 0.78)}, ${rgbaFromHex(mixHex(surfaceBottom, "#dfba75", 0.24), 0.76)})`,
      "--theme-dice-viewport-grad": `radial-gradient(120% 90% at 50% 0%, ${rgbaFromHex(mixHex(surfaceTop, "#ffe8ba", 0.26), 0.52)}, ${rgbaFromHex(mixHex(surfaceMid, "#e7c582", 0.24), 0.68)} 46%, ${rgbaFromHex(mixHex(surfaceBottom, "#c89549", 0.26), 0.72)} 100%)`,
      "--theme-badge-grad": `linear-gradient(180deg, ${rgbaFromHex(mixHex(surfaceTop, "#fbe7bf", 0.22), 0.82)}, ${rgbaFromHex(mixHex(surfaceBottom, "#e6c88d", 0.24), 0.8)})`,
      "--theme-badge-reveal-grad": `linear-gradient(135deg, ${rgbaFromHex(mixHex(surfaceTop, "#ffdeb0", 0.28), 0.92)}, ${rgbaFromHex(mixHex(theme.accent, "#f0ba73", 0.35), 0.92)})`,
      "--theme-badge-hidden-grad": `linear-gradient(180deg, ${scaleHex(theme.bgMid, 1.15)}, ${scaleHex(theme.bgBottom, 1.1)})`,
      "--theme-button-grad": `linear-gradient(180deg, ${accentTop} 0%, ${accentMid} 58%, ${accentBottom} 100%)`,
      "--theme-button-border": scaleHex(theme.accent, 0.46),
      "--theme-button-text": mixHex(theme.surface, "#ffffff", 0.72),
      "--theme-chip-grad": `linear-gradient(180deg, ${accentTop}, ${accentMid})`,
      "--theme-side-toggle-grad": `linear-gradient(180deg, ${accentTop}, ${accentDark})`,
      "--theme-side-text": mixHex(theme.text, "#3d281d", 0.3),
      "--base-image": filteredImageUrl,
      "--theme-image-layer": imageLayer
    };
  }

  function applyThemeToDocument(themeRaw){
    const vars = buildThemeCssVars(themeRaw);
    const rootStyle = document.documentElement.style;
    for(const [name, value] of Object.entries(vars)){
      rootStyle.setProperty(name, value);
    }
  }

  const defaultK = () => ({
    multiHit: 2, highHit: 1, lowHit: 1,
    singlePow: 1, spreadPow: 1, highPow: 2, lowPow: 1,
    intReduce: 1, placePow: 1, chargePow: 1, statStep: 5,
    traitStep: 5, phyHitTrait: 0, plasmaHitTrait: 0, plasmaPowTrait: 1, itemHitTrait: 0,
    baseStrStep: 5, baseDexStep: 5, baseIntStep: 5, baseChaStep: 5,
    basePhyHitStr: 1, basePhyHitDex: 1,
    basePlasmaHitDex: 1, basePlasmaHitInt: 1, basePlasmaHitMode: "max",
    baseItemHitDex: 1, baseItemHitCha: 0,
    basePhyPowStr: 1, basePlasmaPowInt: 1, basePlasmaPowDex: 1,
    strHitStep: 3, strHitGain: 1,
    dexDcStep: 4, dexDcGain: 1,
    dexHitStep: 10, dexHitGain: 1,
    intHitStep: 4, intHitGain: 1,
    intEffStep: 4, intEffChancePct: 10,
    plasmaPowStep: 3, plasmaPowGain: 2,
    closeStrPowStep: 3, closeStrPowGain: 1,
    closeDexPowStep: 5, closeDexPowGain: 1,
    farPlasmaPowStep: 3, farPlasmaPowGain: 1,
    farIntPowStep: 5, farIntPowGain: 1,
    poolBase: 5, poolStart: 4, poolStep: 4, poolGain: 1,
    chaGuide: "NPC 이벤트/위압 판정은 GM 재량 적용"
  });

  const defaultPC = (index = 0) => ({
    pool: 5,
    hp: 20,
    hpNow: 20,
    str: 5,
    dex: 5,
    int: 5,
    plasmaPower: 5,
    cha: 5,
    gold: 0,
    plasmaNow: getPlasmaMaxFromPoolStat(5),
    plasmaMax: getPlasmaMaxFromPoolStat(5),
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
    targetMonsterId: "",
    plasmaLayers: [],
    plasmaSkillBook: [],
    plasmaSkillBookUpdatedAt: 0
  });

  const defaultState = () => ({
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
  });

  function normalizeRoomId(raw){
    const room = String(raw || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    return room || DEFAULT_ROOM_ID;
  }

  function safeText(value, maxLen = 80){
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.slice(0, maxLen);
  }

  function normalizeInviteToken(raw){
    const token = String(raw || "").trim();
    return /^[A-Za-z0-9_-]{16,200}$/.test(token) ? token : "";
  }

  function readInviteTokenFromUrl(){
    try{
      const params = new URLSearchParams(window.location.search || "");
      return normalizeInviteToken(params.get(INVITE_QUERY_KEY) || "");
    }catch(_err){
      return "";
    }
  }

  function readInviteTokenCache(){
    try{
      return normalizeInviteToken(localStorage.getItem(INVITE_TOKEN_STORE_KEY) || "");
    }catch(_err){
      return "";
    }
  }

  function writeInviteTokenCache(token){
    const next = normalizeInviteToken(token);
    if(!next) return;
    try{
      localStorage.setItem(INVITE_TOKEN_STORE_KEY, next);
    }catch(_err){
      /* ignore localStorage failures */
    }
  }

  function syncInviteTokenCacheFromUrl(){
    const fromUrl = readInviteTokenFromUrl();
    if(!fromUrl) return;
    writeInviteTokenCache(fromUrl);
  }

  function getInviteToken(){
    const fromUrl = readInviteTokenFromUrl();
    if(fromUrl) return fromUrl;
    return readInviteTokenCache();
  }

  function sanitizeStatusEffects(list){
    const src = Array.isArray(list) ? list : [];
    const out = [];
    for(const item of src){
      const key = safeText(item || "", 40);
      if(!STATUS_EFFECT_KEY_SET.has(key)) continue;
      if(out.includes(key)) continue;
      out.push(key);
      if(out.length >= STATUS_EFFECTS.length) break;
    }
    return out;
  }

  function createEmptyInjuryMap(){
    if(InjuryBodyMap && typeof InjuryBodyMap.createEmptyMap === "function"){
      return InjuryBodyMap.createEmptyMap();
    }
    return {};
  }

  function sanitizeInjuryMap(raw){
    if(InjuryBodyMap && typeof InjuryBodyMap.sanitizeMap === "function"){
      return InjuryBodyMap.sanitizeMap(raw);
    }
    return createEmptyInjuryMap();
  }

  function safeItemDesc(value, maxLen = 500){
    const normalized = String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+\n/g, "\n");
    return normalized.slice(0, maxLen).trim();
  }

  function safeMemo(value, maxLen = 2000){
    return String(value ?? "").replace(/\r\n/g, "\n").slice(0, maxLen);
  }

  function sanitizeAvatarDataUrl(value){
    const raw = String(value ?? "").trim();
    if(!raw) return "";
    if(!raw.startsWith("data:image/")) return "";
    if(raw.length > MAX_AVATAR_DATAURL_LEN) return "";
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
    if(options.some((option) => option.value === shapeValue)) return shapeValue;
    return options[0] ? options[0].value : "";
  }

  function normalizeIntensity(raw){
    const value = String(raw || "");
    if(["high", "mid", "low"].includes(value)) return value;
    return "mid";
  }

  function normalizePlasmaLayer(layer, index = 0){
    const raw = layer && typeof layer === "object" ? layer : {};
    const intensity = normalizeIntensity(raw.intensity);
    const use = clamp(toInt(raw.use || 1), 1, 99);
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
      level: clamp(toInt(raw.level || 1), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX),
      buffHit: clamp(toInt(raw.buffHit), 0, 99),
      buffPow: clamp(toInt(raw.buffPow), 0, 99),
      hitBonus: clamp(toInt(raw.hitBonus), -99, 99),
      powBonus: clamp(toInt(raw.powBonus), -99, 99)
    };
  }

  function getPlasmaSkillUseAmount(skill){
    const baseCost = clamp(toInt(skill && skill.baseCost), 1, 99);
    const level = clamp(toInt(skill && skill.level), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX);
    return clamp(baseCost * level, 1, 999);
  }

  function getPlasmaSkillLevelProgress(skill, sourcePowRaw = null){
    const level = clamp(toInt(skill && skill.level), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX);
    const levelUps = Math.max(0, level - PLASMA_SKILL_LEVEL_MIN);
    const sourcePow = (sourcePowRaw === null || sourcePowRaw === undefined)
      ? clamp(toInt(skill && skill.powBonus), -99999, 99999)
      : clamp(toInt(sourcePowRaw), -99999, 99999);
    const yHalf = sourcePow / 2;
    let hitPenaltyRaw = 0;
    let powLevelBonusRaw = 0;
    if(levelUps === 1){
      hitPenaltyRaw = 1 + yHalf;
      powLevelBonusRaw = 1 + yHalf;
    }else if(levelUps >= 2){
      hitPenaltyRaw = 3 + yHalf;
      powLevelBonusRaw = 2 + (2 * yHalf);
    }
    return { level, levelUps, hitPenaltyRaw, powLevelBonusRaw, yHalf };
  }

  function getPlasmaSkillEffectiveBonuses(skill){
    const baseHitBonus = clamp(toInt(skill && skill.hitBonus), -99, 99);
    const basePowBonus = clamp(toInt(skill && skill.powBonus), -99, 99);
    const levelProgress = getPlasmaSkillLevelProgress(skill, basePowBonus);
    const hitPenaltyRaw = levelProgress.hitPenaltyRaw;
    const powLevelBonusRaw = levelProgress.powLevelBonusRaw;
    return {
      level: levelProgress.level,
      levelUps: levelProgress.levelUps,
      baseHitBonus,
      basePowBonus,
      hitPenaltyRaw,
      yHalf: levelProgress.yHalf,
      powLevelBonusRaw,
      hitBonus: Math.floor(baseHitBonus - hitPenaltyRaw),
      powBonus: Math.floor(basePowBonus + powLevelBonusRaw)
    };
  }

  function getPcActivePlasmaSkill(pc){
    if(!pc || typeof pc !== "object") return null;
    const activeId = safeText(pc.activePlasmaSkillId || "", 60);
    if(!activeId) return null;
    const skillBook = normalizePlasmaSkillBook(pc.plasmaSkillBook);
    return skillBook.find((entry) => entry.id === activeId) || null;
  }

  function normalizePlasmaSkillBook(book){
    const src = Array.isArray(book) ? book : [];
    return src
      .map((entry, index) => normalizePlasmaSkillEntry(entry, index))
      .slice(0, MAX_PLASMA_SKILL_BOOK);
  }

  function normalizeMonsterTargetPlayerSlot(rawSlot){
    const raw = rawSlot ?? "";
    if(raw === "") return MONSTER_TARGET_NONE;
    return clamp(toInt(raw), MONSTER_TARGET_NONE, MAX_PLAYERS - 1);
  }

  function normalizeMonsterTargetFollowerId(rawId){
    return safeText(rawId || "", 60);
  }

  function normalizeDamageDiceSides(rawSides, fallback = 6){
    const value = toInt(rawSides);
    if([4, 6, 8, 10, 12, 20].includes(value)) return value;
    const fallbackSides = toInt(fallback);
    return [4, 6, 8, 10, 12, 20].includes(fallbackSides) ? fallbackSides : 6;
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

  function formatClock(ts){
    const date = new Date(toInt(ts));
    if(Number.isNaN(date.getTime())) return "--:--:--";
    return date.toLocaleTimeString("ko-KR", { hour12: false });
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
      desc: safeItemDesc(raw.desc || "", 500),
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
      desc: safeItemDesc(raw.desc || "", 500),
      qty: clamp(toInt(raw.qty || 1), 1, 9999)
    };
  }

  function normalizeFollowerTemplate(template, index = 0){
    const raw = template && typeof template === "object" ? template : {};
    const name = safeText(raw.name || `동행 NPC 템플릿 ${index + 1}`, 40);
    const hpMax = clamp(toInt(raw.hpMax || raw.hp || 10), 1, 99999);
    const hpNow = clamp(toInt(raw.hpNow ?? raw.hp ?? hpMax), 0, hpMax);
    const plasmaMax = clamp(toInt(raw.plasmaMax || raw.pool || 5), 1, 99999);
    const plasmaNow = clamp(toInt((raw.plasmaNow ?? raw.plasma) || plasmaMax), 0, plasmaMax);
    const plasmaCap = clamp(toInt(raw.plasmaCap || Math.min(2, plasmaMax)), 1, plasmaMax);
    const hunger = clamp(toInt(raw.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
    const dc = clamp(toInt(raw.dc ?? raw.defenseDc ?? PLAYER_BASE_DC), 1, 99999);
    const hitBonus = clamp(toInt(raw.hitBonus ?? raw.attackHitBonus ?? raw.alwaysHit ?? 0), -99, 99);
    const powBonus = clamp(toInt(raw.powBonus ?? raw.attackPowBonus ?? raw.alwaysPow ?? 0), -99, 99);
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
      dc,
      hitBonus,
      powBonus,
      note: safeText(raw.note || "", 120),
      statusEffects: sanitizeStatusEffects(raw.statusEffects),
      injuryMap: sanitizeInjuryMap(raw.injuryMap || raw.injuries || raw.bodyInjury || {})
    };
  }

  function normalizeFollowerNpc(npc, index = 0){
    const raw = npc && typeof npc === "object" ? npc : {};
    const name = safeText(raw.name || `동행 NPC ${index + 1}`, 40);
    const hpMax = clamp(toInt(raw.hpMax || raw.hp || 10), 1, 99999);
    const hpNow = clamp(toInt(raw.hpNow ?? raw.hp ?? hpMax), 0, hpMax);
    const plasmaMax = clamp(toInt(raw.plasmaMax || raw.pool || 5), 1, 99999);
    const plasmaNow = clamp(toInt((raw.plasmaNow ?? raw.plasma) || plasmaMax), 0, plasmaMax);
    const plasmaCap = clamp(toInt(raw.plasmaCap || Math.min(2, plasmaMax)), 1, plasmaMax);
    const hunger = clamp(toInt(raw.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
    const dc = clamp(toInt(raw.dc ?? raw.defenseDc ?? PLAYER_BASE_DC), 1, 99999);
    const hitBonus = clamp(toInt(raw.hitBonus ?? raw.attackHitBonus ?? raw.alwaysHit ?? 0), -99, 99);
    const powBonus = clamp(toInt(raw.powBonus ?? raw.attackPowBonus ?? raw.alwaysPow ?? 0), -99, 99);
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
      dc,
      hitBonus,
      powBonus,
      note: safeText(raw.note || "", 120),
      statusEffects: sanitizeStatusEffects(raw.statusEffects),
      injuryMap: sanitizeInjuryMap(raw.injuryMap || raw.injuries || raw.bodyInjury || {})
    };
  }

  function normalizeMonsterTemplate(monster, index = 0){
    const raw = monster && typeof monster === "object" ? monster : {};
    const name = safeText(raw.name || `몬스터${index + 1}`, 40);
    const kind = (raw.kind === "swarm") ? "swarm" : "single";
    const dcPublic = parseBooleanFlag(raw.dcPublic)
      || parseBooleanFlag(raw.showDc)
      || parseBooleanFlag(raw.dcVisible);
    return {
      id: safeText(raw.id || makeId("mon"), 60),
      name: name || `몬스터${index + 1}`,
      image: sanitizeMonsterImageDataUrl(raw.image || raw.avatar || ""),
      kind,
      hp: clamp(toInt(raw.hp || 20), 1, 999999),
      dc: clamp(toInt(raw.dc || 12), 1, 99999),
      eva: clamp(toInt(raw.eva || 0), -999, 999),
      dcBonus: clamp(toInt(raw.dcBonus ?? raw.monsterDcBonus ?? 0), -99, 99),
      attackHitBonus: clamp(toInt(raw.attackHitBonus ?? raw.monsterAttackHitBonus ?? raw.hitBonus ?? 0), -99, 99),
      extraDamage: clamp(toInt(raw.extraDamage || 0), -999, 999),
      damageDiceSides: normalizeDamageDiceSides(raw.damageDiceSides ?? raw.damageDice ?? raw.damageDie, 6),
      dcPublic,
      note: safeMemo(raw.note || "", 500)
    };
  }

  function normalizeActiveMonster(monster, index = 0){
    const raw = monster && typeof monster === "object" ? monster : {};
    const name = safeText(raw.name || `운영몬스터${index + 1}`, 40);
    const hpMax = clamp(toInt(raw.hpMax || raw.hp || 20), 1, 999999);
    const hpNow = clamp(toInt(raw.hpNow ?? raw.hp ?? hpMax), 0, hpMax);
    const dcPublic = parseBooleanFlag(raw.dcPublic)
      || parseBooleanFlag(raw.showDc)
      || parseBooleanFlag(raw.dcVisible);
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
      statusEffects: sanitizeStatusEffects(raw.statusEffects),
      targetPlayerSlot: normalizeMonsterTargetPlayerSlot(raw.targetPlayerSlot),
      targetFollowerId: normalizeMonsterTargetFollowerId(raw.targetFollowerId ?? raw.targetNpcId),
      statusMemo: safeMemo(raw.statusMemo || raw.note || "", 500),
      damageDiceSides: normalizeDamageDiceSides(raw.damageDiceSides ?? raw.damageDice ?? raw.damageDie, 6),
      attackHitBonus: clamp(toInt(raw.attackHitBonus ?? raw.monsterAttackHitBonus ?? raw.hitBonus ?? 0), -99, 99),
      extraDamage: clamp(toInt(raw.extraDamage || 0), -999, 999),
      dcBonus: clamp(toInt(raw.dcBonus ?? raw.monsterDcBonus ?? 0), -99, 99),
      dcPublic
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

  function normalizeStateShape(raw){
    const next = Object.assign(defaultState(), raw || {});
    next.k = Object.assign(defaultK(), next.k || {});
    next.theme = normalizeTheme(next.theme || {});
    next.diceAppearance = normalizeDiceAppearance(next.diceAppearance || {});
    const rawPartyFollowers = Array.isArray(next.partyFollowers) ? next.partyFollowers : [];
    const templates = Array.isArray(next.itemTemplates) ? next.itemTemplates : [];
    next.itemTemplates = templates.map((item, index) => normalizeItemTemplate(item, index));
    const npcTemplates = Array.isArray(next.npcTemplates) ? next.npcTemplates : [];
    next.npcTemplates = npcTemplates.map((template, index) => normalizeFollowerTemplate(template, index));
    const monsters = Array.isArray(next.monsterTemplates) ? next.monsterTemplates : [];
    next.monsterTemplates = monsters.map((monster, index) => normalizeMonsterTemplate(monster, index));
    const activeMonsters = Array.isArray(next.activeMonsters) ? next.activeMonsters : [];
    next.activeMonsters = activeMonsters.map((monster, index) => normalizeActiveMonster(monster, index));
    const publishedActiveMonsters = Array.isArray(next.publishedActiveMonsters) ? next.publishedActiveMonsters : [];
    next.publishedActiveMonsters = publishedActiveMonsters.map((monster, index) => normalizeActiveMonster(monster, index));
    const logs = Array.isArray(next.logs) ? next.logs : [];
    next.logs = logs.map((entry, index) => normalizeLogEntry(entry, index)).slice(-LOG_LIMIT);
    next.encounter = normalizeEncounterConfig(next.encounter || {});
    next.publishedEncounter = normalizeEncounterConfig(next.publishedEncounter || {});

    const pcs = Array.isArray(next.pcs) ? next.pcs.slice(0, MAX_PLAYERS) : [];
    while(pcs.length < MAX_PLAYERS) pcs.push(defaultPC(pcs.length));
    const legacyFollowers = [];

    next.pcs = pcs.map((pc, index) => {
      const merged = Object.assign(defaultPC(index), pc || {});
      merged.hp = clamp(toInt(merged.hp), 0, 99999);
      merged.hpNow = clamp(toInt(merged.hpNow ?? merged.hp), 0, merged.hp);
      merged.str = clamp(toInt(merged.str), 0, 99999);
      merged.dex = clamp(toInt(merged.dex), 0, 99999);
      merged.int = clamp(toInt(merged.int), 0, 99999);
      merged.plasmaPower = clamp(toInt(merged.plasmaPower), 0, 99999);
      merged.cha = clamp(toInt(merged.cha), 0, 99999);
      merged.pool = clamp(toInt(merged.pool || merged.plasmaMax || 5), 1, 99999);
      merged.gold = clamp(toInt(merged.gold), 0, 999999999);
      merged.plasmaMax = getPlasmaMaxFromPoolStat(merged.pool, next.k);
      merged.plasmaNow = clamp(toInt(merged.plasmaNow), 0, merged.plasmaMax);
      merged.plasmaCap = getEffectivePlasmaCap(merged, getStatStep(next.k));
      merged.alwaysHit = clamp(toInt(merged.alwaysHit), -99, 99);
      merged.alwaysPow = clamp(toInt(merged.alwaysPow), -99, 99);
      merged.skipTurns = clamp(toInt(merged.skipTurns), 0, 99);
      merged.skillPoints = clamp(toInt(merged.skillPoints), 0, 99999);
      merged.multi = clamp(toInt(merged.multi || 1), 1, getEffectivePlasmaCap(merged, getStatStep(next.k)));
      merged.type = normalizeAttackType(merged.type);
      merged.distance = DISTANCE_KEYS.includes(String(merged.distance || "")) ? String(merged.distance) : "close";
      merged.plasmaRangeKind = (String(merged.plasmaRangeKind || "") === "far") ? "far" : "close";
      merged.shape = normalizeShapeForType(merged.type, merged.shape);
      merged.intensity = normalizeIntensity(merged.intensity);
      merged.name = safeText(merged.name || `User${index + 1}`, 24) || `User${index + 1}`;
      merged.avatar = sanitizeAvatarDataUrl(merged.avatar);
      merged.statusEffects = sanitizeStatusEffects(merged.statusEffects);
      merged.hunger = clamp(toInt(merged.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
      merged.injuryMap = sanitizeInjuryMap(merged.injuryMap || merged.injuries || merged.bodyInjury || {});
      merged.memo = safeMemo(merged.memo || "", 2000);
      merged.targetMonsterId = safeText(merged.targetMonsterId || "", 60);
      const layers = Array.isArray(merged.plasmaLayers) ? merged.plasmaLayers : [];
      merged.plasmaLayers = layers.map((layer, layerIndex) => normalizePlasmaLayer(layer, layerIndex)).slice(-20);
      merged.plasmaSkillBook = normalizePlasmaSkillBook(merged.plasmaSkillBook);
      merged.plasmaSkillBookUpdatedAt = clamp(toInt(merged.plasmaSkillBookUpdatedAt), 0, SKILL_BOOK_TS_MAX);
      merged.activePlasmaSkillId = safeText(merged.activePlasmaSkillId || "", 60);
      if(merged.activePlasmaSkillId && !merged.plasmaSkillBook.some((entry) => entry.id === merged.activePlasmaSkillId)){
        merged.activePlasmaSkillId = "";
      }
      const inv = Array.isArray(merged.inventory) ? merged.inventory : [];
      merged.inventory = inv.map((item, invIndex) => normalizeInventoryItem(item, invIndex));
      const followers = Array.isArray(merged.followers) ? merged.followers : [];
      merged.followers = followers
        .map((npc, npcIndex) => normalizeFollowerNpc(npc, npcIndex))
        .slice(0, MAX_FOLLOWERS_PER_PC);
      legacyFollowers.push(...merged.followers);
      merged.followers = [];
      return merged;
    });

    const normalizedPartyFollowers = rawPartyFollowers
      .map((npc, npcIndex) => normalizeFollowerNpc(npc, npcIndex))
      .slice(0, MAX_PARTY_FOLLOWERS);
    next.partyFollowers = (normalizedPartyFollowers.length > 0 ? normalizedPartyFollowers : legacyFollowers)
      .map((npc, npcIndex) => normalizeFollowerNpc(npc, npcIndex))
      .slice(0, MAX_PARTY_FOLLOWERS);

    next.activePc = clamp(toInt(next.activePc), 0, MAX_PLAYERS - 1);
    next.syncVersion = clamp(toInt(next.syncVersion), 0, 2147483647);
    next.dc = toInt(next.dc ?? 12);
    next.enemyEva = toInt(next.enemyEva ?? 0);
    next.showDcToUsers = next.showDcToUsers !== false;
    return next;
  }

  function mergeIncomingMonsterFieldsWithLocal(rawNext, rawLocal){
    const source = rawNext && typeof rawNext === "object" ? rawNext : {};
    const local = rawLocal && typeof rawLocal === "object" ? rawLocal : {};
    const mergeById = (listRaw, localListRaw, fields) => {
      if(!Array.isArray(listRaw)) return listRaw;
      const localList = Array.isArray(localListRaw) ? localListRaw : [];
      const localById = new Map();
      for(const localItemRaw of localList){
        if(!localItemRaw || typeof localItemRaw !== "object") continue;
        const localId = safeText(localItemRaw.id || "", 60);
        if(!localId || localById.has(localId)) continue;
        localById.set(localId, localItemRaw);
      }
      if(localById.size <= 0) return listRaw;
      return listRaw.map((monsterRaw) => {
        if(!monsterRaw || typeof monsterRaw !== "object") return monsterRaw;
        const id = safeText(monsterRaw.id || "", 60);
        if(!id) return monsterRaw;
        const localMonster = localById.get(id);
        if(!localMonster) return monsterRaw;
        const merged = Object.assign({}, monsterRaw);
        for(const field of fields){
          if(
            !Object.prototype.hasOwnProperty.call(monsterRaw, field)
            && Object.prototype.hasOwnProperty.call(localMonster, field)
          ){
            merged[field] = localMonster[field];
          }
        }
        return merged;
      });
    };

    const out = Object.assign({}, source);
    out.activeMonsters = mergeById(
      source.activeMonsters,
      local.activeMonsters,
      ["targetPlayerSlot", "targetFollowerId", "damageDiceSides", "attackHitBonus", "extraDamage", "dcBonus", "dcPublic"]
    );
    out.publishedActiveMonsters = mergeById(
      source.publishedActiveMonsters,
      local.publishedActiveMonsters,
      ["targetPlayerSlot", "targetFollowerId", "damageDiceSides", "attackHitBonus", "extraDamage", "dcBonus", "dcPublic"]
    );
    out.monsterTemplates = mergeById(
      source.monsterTemplates,
      local.monsterTemplates,
      ["damageDiceSides", "attackHitBonus", "extraDamage", "dcBonus", "dcPublic"]
    );
    out.partyFollowers = mergeById(
      source.partyFollowers,
      local.partyFollowers,
      ["dc", "hitBonus", "powBonus"]
    );
    out.npcTemplates = mergeById(
      source.npcTemplates,
      local.npcTemplates,
      ["dc", "hitBonus", "powBonus"]
    );
    return out;
  }

  let state = defaultState();
  let whisperLogs = [];
  let rolling = false;
  let currentComputed = { finalHit: 0, finalPow: 0 };
  let socket = null;
  let isApplyingRemote = false;
  let syncTimer = null;
  let userActionSyncTimer = null;
  let pendingUserActionSync = null;
  let memoSyncTimer = null;
  let editingItemTemplateId = "";
  let editingPlasmaSkillId = "";
  let editingMonsterTemplateId = "";
  let pendingMonsterTemplateImageDataUrl = "";
  let monsterTemplateImageTouched = false;
  let monsterTemplateImageApplying = false;
  let pendingFollowerNpcImageDataUrl = "";
  let lastAutoDamageDiceAttackType = "";
  let diceTotalFxLockUntil = 0;
  let diceDamageShapeHoldUntil = 0;
  let diceDamageShapeHoldTimer = null;
  const expandedPlayerStatusEditorSlots = new Set();
  let monsterCategoryOpen = false;
  let localSaveWarned = false;
  let localSaveMode = "full";
  let adminSessionUnlocked = false;
  let clientIdentityKey = "";
  let pendingAdminSyncAfterJoin = false;
  let awaitingRoomState = false;
  let joinedRoomId = "";
  let localSyncVersion = 0;
  let lastScrollY = 0;
  let headerScrollTicking = false;
  let headerHideTravel = 0;
  let headerRevealTravel = 0;
  let headerLastToggleAt = 0;
  let dice3d = null;
  let dice3dResizeObserver = null;
  let selectedMonsterAttackId = "";
  let selectedNpcBattleId = "";
  let adminLastActivePc = 0;
  const expandedMonsterAdminCards = new Set();
  let rollSyncQueue = Promise.resolve();
  const rollSyncPending = new Map();
  const rollSyncSeen = new Map();
  syncInviteTokenCacheFromUrl();

  function readAdminSessionCache(){
    try{
      const raw = localStorage.getItem(ADMIN_SESSION_STORE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== "object") return null;
      const key = safeText(parsed.key || "", 120);
      const ts = clamp(toInt(parsed.ts), 0, 9999999999999);
      if(!key || !ts) return null;
      if((Date.now() - ts) > ADMIN_SESSION_TTL_MS) return null;
      return { key, ts };
    }catch(_err){
      return null;
    }
  }

  function saveAdminSessionCache(){
    const key = safeText(clientIdentityKey || "local-device", 120);
    try{
      localStorage.setItem(ADMIN_SESSION_STORE_KEY, JSON.stringify({
        key,
        ts: Date.now()
      }));
    }catch(_err){
      /* ignore localStorage failures */
    }
  }

  function tryRestoreAdminSessionUnlock(){
    const cache = readAdminSessionCache();
    if(!cache) return false;
    const currentKey = safeText(clientIdentityKey || "", 120);
    if(currentKey && cache.key !== currentKey) return false;
    adminSessionUnlocked = true;
    return true;
  }

  function readKFromUI(){
    const prev = Object.assign(defaultK(), state && state.k ? state.k : {});
    const getNum = (id, fallback) => {
      const el = $(id);
      return el ? toInt(el.value) : toInt(fallback);
    };
    const getText = (id, fallback = "") => {
      const el = $(id);
      return safeText(el ? el.value : fallback, 160);
    };
    return Object.assign({}, prev, {
      strHitStep: clamp(getNum("gm_str_step", prev.strHitStep), 1, 999),
      strHitGain: clamp(getNum("gm_str_gain", prev.strHitGain), 0, 999),
      dexDcStep: clamp(getNum("gm_dex_dc_step", prev.dexDcStep), 1, 999),
      dexDcGain: clamp(getNum("gm_dex_dc_gain", prev.dexDcGain), 0, 999),
      dexHitStep: clamp(getNum("gm_dex_hit_step", prev.dexHitStep), 1, 999),
      dexHitGain: clamp(getNum("gm_dex_hit_gain", prev.dexHitGain), 0, 999),
      intHitStep: clamp(getNum("gm_int_hit_step", prev.intHitStep), 1, 999),
      intHitGain: clamp(getNum("gm_int_hit_gain", prev.intHitGain), 0, 999),
      intEffStep: clamp(getNum("gm_int_eff_step", prev.intEffStep), 1, 999),
      intEffChancePct: clamp(getNum("gm_int_eff_chance", prev.intEffChancePct), 0, 100),
      plasmaPowStep: clamp(getNum("gm_plasma_pow_step", prev.plasmaPowStep), 1, 999),
      plasmaPowGain: clamp(getNum("gm_plasma_pow_gain", prev.plasmaPowGain), 0, 999),
      closeStrPowStep: clamp(getNum("gm_close_str_pow_step", prev.closeStrPowStep), 1, 999),
      closeStrPowGain: clamp(getNum("gm_close_str_pow_gain", prev.closeStrPowGain), 0, 999),
      closeDexPowStep: clamp(getNum("gm_close_dex_pow_step", prev.closeDexPowStep), 1, 999),
      closeDexPowGain: clamp(getNum("gm_close_dex_pow_gain", prev.closeDexPowGain), 0, 999),
      farPlasmaPowStep: clamp(getNum("gm_far_plasma_pow_step", prev.farPlasmaPowStep), 1, 999),
      farPlasmaPowGain: clamp(getNum("gm_far_plasma_pow_gain", prev.farPlasmaPowGain), 0, 999),
      farIntPowStep: clamp(getNum("gm_far_int_pow_step", prev.farIntPowStep), 1, 999),
      farIntPowGain: clamp(getNum("gm_far_int_pow_gain", prev.farIntPowGain), 0, 999),
      poolBase: clamp(getNum("gm_pool_base", prev.poolBase), 1, 99999),
      poolStart: clamp(getNum("gm_pool_start", prev.poolStart), 1, 99999),
      poolStep: clamp(getNum("gm_pool_step", prev.poolStep), 1, 99999),
      poolGain: clamp(getNum("gm_pool_gain", prev.poolGain), 1, 99999),
      chaGuide: getText("gm_cha_guide", prev.chaGuide || "")
    });
  }

  function writeKToUI(k){
    const next = Object.assign(defaultK(), k || {});
    const setNum = (id, value) => {
      const el = $(id);
      if(el) el.value = String(toInt(value));
    };
    const setText = (id, value) => {
      const el = $(id);
      if(el) el.value = safeText(value || "", 160);
    };
    setNum("gm_str_step", next.strHitStep);
    setNum("gm_str_gain", next.strHitGain);
    setNum("gm_dex_dc_step", next.dexDcStep);
    setNum("gm_dex_dc_gain", next.dexDcGain);
    setNum("gm_dex_hit_step", next.dexHitStep);
    setNum("gm_dex_hit_gain", next.dexHitGain);
    setNum("gm_int_hit_step", next.intHitStep);
    setNum("gm_int_hit_gain", next.intHitGain);
    setNum("gm_int_eff_step", next.intEffStep);
    setNum("gm_int_eff_chance", next.intEffChancePct);
    setNum("gm_plasma_pow_step", next.plasmaPowStep);
    setNum("gm_plasma_pow_gain", next.plasmaPowGain);
    setNum("gm_close_str_pow_step", next.closeStrPowStep);
    setNum("gm_close_str_pow_gain", next.closeStrPowGain);
    setNum("gm_close_dex_pow_step", next.closeDexPowStep);
    setNum("gm_close_dex_pow_gain", next.closeDexPowGain);
    setNum("gm_far_plasma_pow_step", next.farPlasmaPowStep);
    setNum("gm_far_plasma_pow_gain", next.farPlasmaPowGain);
    setNum("gm_far_int_pow_step", next.farIntPowStep);
    setNum("gm_far_int_pow_gain", next.farIntPowGain);
    setNum("gm_pool_base", next.poolBase);
    setNum("gm_pool_start", next.poolStart);
    setNum("gm_pool_step", next.poolStep);
    setNum("gm_pool_gain", next.poolGain);
    setText("gm_cha_guide", next.chaGuide || "");
  }

  function updateThemeBrightnessLabel(value){
    const label = $("themeBrightnessValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 60, 120)}%`;
  }

  function updateThemeImageBrightnessLabel(value){
    const label = $("themeImageBrightnessValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 40, 180)}%`;
  }

  function updateThemeImageSaturationLabel(value){
    const label = $("themeImageSaturationValue");
    if(!label) return;
    label.textContent = `${clamp(toInt(value), 0, 200)}%`;
  }

  function readThemeFromUI(){
    const fallback = normalizeTheme(state && state.theme ? state.theme : defaultTheme());
    const getValue = (id, fallbackValue) => {
      const el = $(id);
      return el ? String(el.value || "") : String(fallbackValue || "");
    };
    return normalizeTheme({
      bgTop: getValue("themeBgTop", fallback.bgTop),
      bgMid: getValue("themeBgMid", fallback.bgMid),
      bgBottom: getValue("themeBgBottom", fallback.bgBottom),
      surface: getValue("themeSurface", fallback.surface),
      text: getValue("themeText", fallback.text),
      muted: getValue("themeMuted", fallback.muted),
      accent: getValue("themeAccent", fallback.accent),
      brightness: toInt(getValue("themeBrightness", fallback.brightness)),
      imageMode: "texture",
      imageDataUrl: fallback.imageDataUrl,
      imageTileW: toInt(getValue("themeImageTileW", fallback.imageTileW)),
      imageTileH: toInt(getValue("themeImageTileH", fallback.imageTileH)),
      imageBrightness: toInt(getValue("themeImageBrightness", fallback.imageBrightness)),
      imageSaturation: toInt(getValue("themeImageSaturation", fallback.imageSaturation))
    });
  }

  function writeThemeToUI(themeRaw){
    const theme = normalizeTheme(themeRaw);
    const assign = (id, value) => {
      const el = $(id);
      if(el) el.value = value;
    };
    assign("themeBgTop", theme.bgTop);
    assign("themeBgMid", theme.bgMid);
    assign("themeBgBottom", theme.bgBottom);
    assign("themeSurface", theme.surface);
    assign("themeText", theme.text);
    assign("themeMuted", theme.muted);
    assign("themeAccent", theme.accent);
    assign("themeBrightness", String(theme.brightness));
    assign("themeImageMode", theme.imageMode);
    assign("themeImageTileW", String(theme.imageTileW));
    assign("themeImageTileH", String(theme.imageTileH));
    assign("themeImageBrightness", String(theme.imageBrightness));
    assign("themeImageSaturation", String(theme.imageSaturation));
    updateThemeBrightnessLabel(theme.brightness);
    updateThemeImageBrightnessLabel(theme.imageBrightness);
    updateThemeImageSaturationLabel(theme.imageSaturation);
  }

  function applyTheme(themeRaw){
    const theme = normalizeTheme(themeRaw);
    applyThemeToDocument(theme);
    updateThemeBrightnessLabel(theme.brightness);
    updateThemeImageBrightnessLabel(theme.imageBrightness);
    updateThemeImageSaturationLabel(theme.imageSaturation);
  }

  function getStatStep(source){
    if(source && typeof source === "object"){
      return clamp(toInt(source.statStep || 5), 1, 99);
    }
    const input = $("k_stat_step");
    if(input) return clamp(toInt(input.value), 1, 99);
    return clamp(toInt(state && state.k && state.k.statStep), 1, 99) || 5;
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
    const max = clamp(toInt((pc && (pc.plasmaMax || getPlasmaMaxFromPoolStat(pc.pool))) || 1), 1, 99999);
    return max;
  }

  function getEffectivePlasmaCap(pc, statStep = 5){
    void statStep;
    const max = clamp(toInt((pc && (pc.plasmaMax || getPlasmaMaxFromPoolStat(pc.pool))) || 1), 1, 99999);
    return max;
  }

  function syncShapeOptionsByType(type, preferredShape){
    const attackType = normalizeAttackType(type);
    const select = $("shape");
    const options = SHAPE_OPTIONS[attackType] || [];
    const selected = normalizeShapeForType(attackType, preferredShape || select.value);

    select.innerHTML = "";
    for(const option of options){
      const el = document.createElement("option");
      el.value = option.value;
      el.textContent = option.label;
      select.appendChild(el);
    }
    select.value = selected;
    return selected;
  }

  function readPcFromUI(){
    const prev = state.pcs[state.activePc] || defaultPC(state.activePc);
    const hp = clamp(toInt($("sta_hp").value), 0, 99999);
    const hpNow = clamp(toInt(prev.hpNow ?? prev.hp ?? hp), 0, hp);
    const plasmaTotal = clamp(toInt($("sta_pool").value), 1, 99999);
    const plasmaMax = getPlasmaMaxFromPoolStat(plasmaTotal, state.k);
    const plasmaCap = getEffectivePlasmaCap({ pool: plasmaTotal, plasmaMax }, getStatStep(state.k));
    const plasmaNow = clamp(toInt(prev.plasmaNow), 0, plasmaMax);
    const intValue = clamp(toInt($("sta_int").value), 0, 99999);
    const effectiveCap = plasmaCap;
    const attackType = normalizeAttackType($("attackType").value);
    const shape = normalizeShapeForType(attackType, $("shape").value);
    const intensity = normalizeIntensity($("intensity").value);
    const maxMulti = (attackType === "plasma") ? effectiveCap : 1;
    const playerTargetMonsterSelect = $("playerTargetMonsterSelect");
    const isUserOwnedSlot = !isAdminRole() && state.activePc === getUserSlot();
    const selectedTargetMonsterId = isUserOwnedSlot && playerTargetMonsterSelect
      ? safeText(playerTargetMonsterSelect.value || "", 60)
      : safeText(prev.targetMonsterId || "", 60);
    return {
      hp,
      hpNow,
      str: clamp(toInt($("sta_str").value), 0, 99999),
      dex: clamp(toInt($("sta_dex").value), 0, 99999),
      int: intValue,
      plasmaPower: clamp(toInt($("sta_plasma_power").value), 0, 99999),
      cha: clamp(toInt($("sta_cha").value), 0, 99999),
      pool: plasmaTotal,
      gold: clamp(toInt(prev.gold), 0, 999999999),
      plasmaNow,
      plasmaMax,
      plasmaCap,
      type: attackType,
      distance: DISTANCE_KEYS.includes($("distanceState").value) ? $("distanceState").value : "close",
      plasmaRangeKind: (String(($("attackRangeState") && $("attackRangeState").value) || prev.plasmaRangeKind || "close") === "far") ? "far" : "close",
      activePlasmaSkillId: safeText(prev.activePlasmaSkillId || "", 60),
      shape,
      intensity,
      multi: clamp(toInt($("multi").value), 1, maxMulti),
      name: safeText($("pc_name").value || prev.name || `User${state.activePc + 1}`, 24) || `User${state.activePc + 1}`,
      avatar: sanitizeAvatarDataUrl(prev.avatar || ""),
      statusEffects: sanitizeStatusEffects(prev.statusEffects),
      hunger: clamp(toInt(prev.hunger ?? HUNGER_MAX), 0, HUNGER_MAX),
      injuryMap: sanitizeInjuryMap(prev.injuryMap || prev.injuries || prev.bodyInjury || {}),
      followers: Array.isArray(prev.followers) ? prev.followers.map((npc, idx) => normalizeFollowerNpc(npc, idx)).slice(0, MAX_FOLLOWERS_PER_PC) : [],
      alwaysHit: clamp(toInt(prev.alwaysHit), -99, 99),
      alwaysPow: clamp(toInt(prev.alwaysPow), -99, 99),
      skipTurns: clamp(toInt(prev.skipTurns), 0, 99),
      skillPoints: clamp(toInt(prev.skillPoints), 0, 99999),
      inventory: Array.isArray(prev.inventory) ? prev.inventory.map((item, idx) => normalizeInventoryItem(item, idx)) : [],
      memo: safeMemo($("userMemo").value || prev.memo || "", 2000),
      targetMonsterId: selectedTargetMonsterId,
      plasmaLayers: [],
      plasmaSkillBook: normalizePlasmaSkillBook(prev.plasmaSkillBook),
      plasmaSkillBookUpdatedAt: clamp(toInt(prev.plasmaSkillBookUpdatedAt), 0, SKILL_BOOK_TS_MAX)
    };
  }

  function writePcToUI(pc){
    pc.hp = clamp(toInt(pc.hp), 0, 99999);
    pc.hpNow = clamp(toInt(pc.hpNow ?? pc.hp), 0, pc.hp);
    const pool = clamp(toInt(pc.pool || pc.plasmaMax || 5), 1, 99999);
    const plasmaMax = getPlasmaMaxFromPoolStat(pool, state.k);
    const plasmaCap = getEffectivePlasmaCap({ pool, plasmaMax }, getStatStep(state.k));
    const plasmaNow = clamp(toInt(pc.plasmaNow), 0, plasmaMax);
    const effectiveCap = plasmaCap;
    pc.pool = pool;
    pc.plasmaMax = plasmaMax;
    pc.plasmaCap = plasmaCap;
    pc.plasmaNow = plasmaNow;

    $("sta_hp").value = pc.hp;
    $("sta_str").value = pc.str;
    $("sta_dex").value = pc.dex;
    $("sta_int").value = pc.int;
    $("sta_plasma_power").value = clamp(toInt(pc.plasmaPower), 0, 99999);
    $("sta_cha").value = pc.cha;
    $("sta_pool").value = pool;
    const attackType = normalizeAttackType(pc.type);
    $("attackType").value = attackType;
    syncShapeOptionsByType(attackType, pc.shape);
    $("distanceState").value = DISTANCE_KEYS.includes(pc.distance) ? pc.distance : "close";
    const attackRangeStateEl = $("attackRangeState");
    if(attackRangeStateEl) attackRangeStateEl.value = String(pc.plasmaRangeKind || "") === "far" ? "far" : "close";
    $("intensity").value = normalizeIntensity(pc.intensity);
    $("multi").value = String(clamp(toInt(pc.multi), 1, effectiveCap));
    $("pc_name").value = pc.name || "";
    $("nameInput").value = pc.name || "";
    $("userMemo").value = safeMemo(pc.memo || "", 2000);
  }

  function getCurrentPlasmaLayerFromPc(pc){
    const intensity = normalizeIntensity(pc.intensity);
    const cap = getEffectivePlasmaCap(pc, getStatStep(state.k));
    const use = clamp(toInt(pc.multi || 1), 1, cap);
    return normalizePlasmaLayer({
      id: makeId("layer"),
      shape: normalizeShapeForType("plasma", pc.shape),
      intensity,
      use
    });
  }

  function getPlasmaLayersForCalc(pc){
    void pc;
    return [];
  }

  function sumPlasmaLayerUse(layers){
    const list = Array.isArray(layers) ? layers : [];
    let total = 0;
    for(const layer of list){
      total += clamp(toInt(layer.use), 0, 99);
    }
    return total;
  }

  function isStabilizeLayerActive(layers){
    const list = Array.isArray(layers) ? layers : [];
    const totalUse = sumPlasmaLayerUse(list);
    const hasStabilize = list.some((layer) => normalizeShapeForType("plasma", layer.shape) === "stabilize");
    const hasHigh = list.some((layer) => normalizeIntensity(layer.intensity) === "high");
    return hasStabilize && hasHigh && totalUse >= 2;
  }

  function calc(pc, k){
    const cfg = Object.assign(defaultK(), k && typeof k === "object" ? k : {});
    const bd = [];
    const attackType = normalizeAttackType(pc.type);
    const shape = normalizeShapeForType(attackType, pc.shape);
    const strValue = clamp(toInt(pc.str), 0, 99999);
    const dexValue = clamp(toInt(pc.dex), 0, 99999);
    const intValue = clamp(toInt(pc.int), 0, 99999);
    const plasmaPowerValue = clamp(toInt(pc.plasmaPower), 0, 99999);
    const chaValue = clamp(toInt(pc.cha), 0, 99999);

    const strHitStep = clamp(toInt(cfg.strHitStep), 1, 999);
    const strHitGain = clamp(toInt(cfg.strHitGain), 0, 999);
    const dexDcStep = clamp(toInt(cfg.dexDcStep), 1, 999);
    const dexDcGain = clamp(toInt(cfg.dexDcGain), 0, 999);
    const dexHitStep = clamp(toInt(cfg.dexHitStep), 1, 999);
    const dexHitGain = clamp(toInt(cfg.dexHitGain), 0, 999);
    const intHitStep = clamp(toInt(cfg.intHitStep), 1, 999);
    const intHitGain = clamp(toInt(cfg.intHitGain), 0, 999);
    const strHit = Math.floor(strValue / strHitStep) * strHitGain;
    const dexDcBonus = Math.floor(dexValue / dexDcStep) * dexDcGain;
    const dexHit = Math.floor(dexValue / dexHitStep) * dexHitGain;
    const intHit = Math.floor(intValue / intHitStep) * intHitGain;
    const baseAttack = strHit + dexHit + intHit;

    let baseHit = baseAttack;
    const basePow = 0;

    bd.push({ k: "스탯 요약", d: 0, note: `근력 ${strValue}, 민첩 ${dexValue}, 지능 ${intValue}, 플라즈마위력 ${plasmaPowerValue}, 매력 ${chaValue}` });
    bd.push({ k: "근력 보정", d: +strHit, note: `근력 ${strHitStep}당 공격 +${strHitGain}` });
    bd.push({ k: "민첩 적중 보정", d: +dexHit, note: `민첩 ${dexHitStep}당 공격 +${dexHitGain}` });
    bd.push({ k: "민첩 DC 보너스", d: +dexDcBonus, note: `민첩 ${dexDcStep}당 DC +${dexDcGain} (방어 판정용)` });
    bd.push({ k: "지능 적중 보정", d: +intHit, note: `지능 ${intHitStep}당 적중 +${intHitGain}` });
    bd.push({ k: "기본 적중", v: baseHit, note: "근력/민첩/지능 합산" });
    bd.push({ k: "기본 위력", v: basePow, note: "기본값 0 (공격 타입 위력 보너스로 계산)" });

    let hitMod = 0;
    let powMod = 0;
    const alwaysHit = clamp(toInt(pc.alwaysHit), -99, 99);
    const alwaysPow = clamp(toInt(pc.alwaysPow), -99, 99);
    if(alwaysHit !== 0){
      hitMod += alwaysHit;
      bd.push({ k: "상시 적중 보정", d: alwaysHit, note: "GM 설정" });
    }
    if(alwaysPow !== 0){
      powMod += alwaysPow;
      bd.push({ k: "상시 위력 보정", d: alwaysPow, note: "GM 설정" });
    }

    const distance = DISTANCE_KEYS.includes(String(pc.distance || "")) ? String(pc.distance) : "close";
    const distanceLabel = DISTANCE_LABEL[distance] || "가까움";
    const attackRangeKind = String(pc.plasmaRangeKind || "") === "far" ? "far" : "close";
    const attackRangeLabel = attackRangeKind === "far" ? "원거리" : "근거리";
    bd.push({ k: "공격 타입", d: 0, note: `${attackRangeLabel} 공격` });

    const closeStrPowStep = clamp(toInt(cfg.closeStrPowStep), 1, 999);
    const closeStrPowGain = clamp(toInt(cfg.closeStrPowGain), 0, 999);
    const closeDexPowStep = clamp(toInt(cfg.closeDexPowStep), 1, 999);
    const closeDexPowGain = clamp(toInt(cfg.closeDexPowGain), 0, 999);
    const farPlasmaPowStep = clamp(toInt(cfg.farPlasmaPowStep), 1, 999);
    const farPlasmaPowGain = clamp(toInt(cfg.farPlasmaPowGain), 0, 999);
    const farIntPowStep = clamp(toInt(cfg.farIntPowStep), 1, 999);
    const farIntPowGain = clamp(toInt(cfg.farIntPowGain), 0, 999);

    if(attackRangeKind === "close"){
      const closeStrPowBonus = Math.floor(strValue / closeStrPowStep) * closeStrPowGain;
      const closeDexPowBonus = Math.floor(dexValue / closeDexPowStep) * closeDexPowGain;
      const closeRangePowBonus = closeStrPowBonus + closeDexPowBonus;
      powMod += closeRangePowBonus;
      bd.push({
        k: "공격 타입 위력 보너스(근거리)",
        d: closeRangePowBonus,
        note: `근력 ${closeStrPowStep}당 +${closeStrPowGain} (${closeStrPowBonus}), 민첩 ${closeDexPowStep}당 +${closeDexPowGain} (${closeDexPowBonus})`
      });
    }else{
      const farPlasmaPowBonus = Math.floor(plasmaPowerValue / farPlasmaPowStep) * farPlasmaPowGain;
      const farIntPowBonus = Math.floor(intValue / farIntPowStep) * farIntPowGain;
      const farRangePowBonus = farPlasmaPowBonus + farIntPowBonus;
      powMod += farRangePowBonus;
      bd.push({
        k: "공격 타입 위력 보너스(원거리)",
        d: farRangePowBonus,
        note: `플라즈마 위력 ${farPlasmaPowStep}당 +${farPlasmaPowGain} (${farPlasmaPowBonus}), 지능 ${farIntPowStep}당 +${farIntPowGain} (${farIntPowBonus})`
      });
    }

    let plasmaLevelForTransform = PLASMA_SKILL_LEVEL_MIN;
    if(attackType === "plasma"){
      const activeSkill = getPcActivePlasmaSkill(pc);
      let skillHitBase = 0;
      let skillPowBase = 0;
      bd.push({ k: "공격/거리", d: 0, note: `${attackRangeLabel} 공격 | 적 거리 ${distanceLabel}` });
      if(activeSkill){
        plasmaLevelForTransform = clamp(toInt(activeSkill.level || PLASMA_SKILL_LEVEL_MIN), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX);
        const skillRangeKind = String(activeSkill.rangeKind || "") === "far" ? "far" : "close";
        const skillRangeLabel = skillRangeKind === "far" ? "원거리 집중" : "근거리 집중";
        let focusHitBonus = 0;
        let focusPowBonus = 0;
        if(attackRangeKind === "close" && skillRangeKind === "close"){
          focusHitBonus = 1;
          focusPowBonus = 1;
        }else if(attackRangeKind === "far" && skillRangeKind === "far"){
          focusHitBonus = 1;
          focusPowBonus = 2;
        }
        skillHitBase += focusHitBonus;
        skillPowBase += focusPowBonus;
        bd.push({
          k: "사거리 집중 보정(적중)",
          d: focusHitBonus,
          note: `기본 ${attackRangeLabel} | 기술 ${skillRangeLabel}`
        });
        bd.push({
          k: "사거리 집중 보정(위력)",
          d: focusPowBonus,
          note: `기본 ${attackRangeLabel} | 기술 ${skillRangeLabel}`
        });

        const templateHitBonus = clamp(toInt(activeSkill.hitBonus), -99, 99);
        const templatePowBonus = clamp(toInt(activeSkill.powBonus), -99, 99);
        if(templateHitBonus !== 0){
          skillHitBase += templateHitBonus;
          bd.push({
            k: "템플릿 보정(적중)",
            d: templateHitBonus,
            note: safeText(activeSkill.name || "플라즈마 기술", 40)
          });
        }
        if(templatePowBonus !== 0){
          skillPowBase += templatePowBonus;
          bd.push({
            k: "템플릿 보정(위력)",
            d: templatePowBonus,
            note: safeText(activeSkill.name || "플라즈마 기술", 40)
          });
        }
      }

      if(shape === "spread"){
        skillHitBase += 1;
        bd.push({ k: "기술 분류: 광역기(적중)", d: +1 });
        skillPowBase -= 1;
        bd.push({ k: "기술 분류: 광역기(위력)", d: -1, note: "범위 확산 위력 페널티" });
      }else if(shape === "stabilize"){
        const teamHit = Math.max(0, clamp(toInt(activeSkill && activeSkill.buffHit), 0, 99));
        const teamPow = Math.max(0, clamp(toInt(activeSkill && activeSkill.buffPow), 0, 99));
        skillHitBase += teamHit;
        skillPowBase += teamPow;
        bd.push({ k: "기술 분류: 강화기", d: 0, note: `팀원 보정 적중 +${teamHit}, 위력 +${teamPow}` });
      }else{
        skillPowBase += 2;
        bd.push({ k: "기술 분류: 일격기(위력)", d: +2, note: "타격형 위력 보정" });
      }

      hitMod += skillHitBase;
      powMod += skillPowBase;

      const riskChancePct = Math.round(getPlasmaUseReductionChance(pc, cfg) * 100);
      bd.push({ k: "지능 효율", d: 0, note: `플라즈마 소모 -1 확률 ${riskChancePct}%` });
    }else{
      bd.push({ k: `${attackType === "physical" ? "물리" : "아이템"} 행동`, d: 0, note: "공격 타입 위력 보너스 적용" });
    }

    if(attackRangeKind === "close"){
      if(distance === "far"){
        hitMod -= 2;
        powMod -= 1;
        bd.push({ k: "거리 페널티(근거리 공격: 적중)", d: -2, note: "적과의 거리 멀음" });
        bd.push({ k: "거리 페널티(근거리 공격: 위력)", d: -1, note: "적과의 거리 멀음" });
      }else if(distance === "very_far"){
        hitMod -= 4;
        powMod -= 2;
        bd.push({ k: "거리 페널티(근거리 공격: 적중)", d: -4, note: "적과의 거리 매우 멀음" });
        bd.push({ k: "거리 페널티(근거리 공격: 위력)", d: -2, note: "적과의 거리 매우 멀음" });
      }
    }else{
      if(distance === "very_close"){
        powMod -= 3;
        bd.push({ k: "거리 페널티(원거리 공격: 위력)", d: -3, note: "적과의 거리 매우 가까움" });
      }else if(distance === "close"){
        powMod -= 2;
        bd.push({ k: "거리 페널티(원거리 공격: 위력)", d: -2, note: "적과의 거리 가까움" });
      }
    }

    const hunger = clamp(toInt(pc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
    if(hunger <= 1){
      hitMod -= 2;
      bd.push({ k: "허기 페널티: 적중", d: -2, note: `배고픔 ${hunger}/${HUNGER_MAX} (1 이하)` });
    }
    if(hunger <= 2){
      powMod -= 1;
      bd.push({ k: "허기 페널티: 위력", d: -1, note: `배고픔 ${hunger}/${HUNGER_MAX} (2 이하)` });
    }

    let finalHit = baseHit + hitMod;
    let finalPow = basePow + powMod;
    if(attackType === "plasma" && plasmaLevelForTransform > PLASMA_SKILL_LEVEL_MIN){
      const x = finalHit;
      const y = finalPow;
      const yHalf = y / 2;
      let levelHitPenaltyRaw = 0;
      let levelPowBonusRaw = 0;
      if(plasmaLevelForTransform === 2){
        levelHitPenaltyRaw = 1 + yHalf;
        levelPowBonusRaw = 1 + yHalf;
      }else{
        levelHitPenaltyRaw = 3 + yHalf;
        levelPowBonusRaw = 2 + (2 * yHalf);
      }
      finalHit = Math.floor(x - levelHitPenaltyRaw);
      finalPow = Math.floor(y + levelPowBonusRaw);
      const yHalfLabel = Number.isInteger(yHalf) ? String(yHalf) : String(yHalf);
      const appliedHitDelta = finalHit - x;
      const appliedPowDelta = finalPow - y;
      bd.push({
        k: "플라즈마 Lv 변환(적중)",
        d: appliedHitDelta,
        note: `Lv ${plasmaLevelForTransform} | x=${x}, y=${y}, y/2=${yHalfLabel}, floor 적용`
      });
      bd.push({
        k: "플라즈마 Lv 변환(위력)",
        d: appliedPowDelta,
        note: `Lv ${plasmaLevelForTransform} | y/2=${yHalfLabel}, floor 적용`
      });
    }

    bd.push({ k: "매력 가이드", d: 0, note: safeText(cfg.chaGuide || "NPC 이벤트/위압 판정은 GM 재량 적용", 160) || "NPC 이벤트/위압 판정은 GM 재량 적용" });
    let note = "즉시 발동";
    if(attackType === "plasma"){
      note = shape === "spread" ? "광역기 사용" : (shape === "stabilize" ? "강화기 사용" : "일격기 사용");
    }else if(attackType === "physical"){
      note = "물리 공격";
    }else if(attackType === "item"){
      note = "아이템 사용";
    }
    return { finalHit, finalPow, note, bd, baseHit, basePow, hitMod, powMod, dcBonus: dexDcBonus };
  }

  function getPlayerDefenseDc(pc, k){
    const cfg = Object.assign(defaultK(), (k && typeof k === "object") ? k : {});
    const dexValue = clamp(toInt(pc && pc.dex), 0, 99999);
    const dexDcStep = clamp(toInt(cfg.dexDcStep), 1, 999);
    const dexDcGain = clamp(toInt(cfg.dexDcGain), 0, 999);
    const dexBonus = Math.floor(dexValue / dexDcStep) * dexDcGain;
    const extraBonus = clamp(toInt(pc && pc.dcBonus), -999, 999);
    const bonus = dexBonus + extraBonus;
    return {
      base: PLAYER_BASE_DC,
      bonus,
      total: PLAYER_BASE_DC + bonus
    };
  }

  function getMonsterAttackDefenseInfo(rawTarget){
    const target = resolveMonsterAttackTarget(rawTarget);
    if(target.kind === "none") return null;
    if(target.kind === "npc"){
      const npcDc = clamp(toInt(target.npc && target.npc.dc), 1, 99999);
      return {
        kind: "npc",
        followerId: target.followerId,
        label: target.label,
        dc: npcDc,
        base: npcDc,
        bonus: 0
      };
    }
    const pc = ensurePc(target.slot);
    const defense = getPlayerDefenseDc(pc, state.k);
    return {
      kind: "pc",
      slot: target.slot,
      label: getPlayerSlotLabel(target.slot),
      dc: defense.total,
      base: defense.base,
      bonus: defense.bonus
    };
  }

  function getDiceSides(){
    const select = $("damageDiceSides") || $("diceSides");
    const sides = toInt(select ? select.value : 6);
    return [4, 6, 8, 10, 12, 20].includes(sides) ? sides : 6;
  }

  function autoSelectDamageDiceByAttackType(typeOverride = "", force = false){
    const select = $("damageDiceSides") || $("diceSides");
    if(!select) return;
    const attackType = normalizeAttackType(typeOverride || (($("attackType") && $("attackType").value) || "plasma"));
    if(!force && attackType === lastAutoDamageDiceAttackType) return;
    lastAutoDamageDiceAttackType = attackType;
    const targetSides = attackType === "plasma"
      ? 10
      : (attackType === "physical" ? 6 : 0);
    if(![4, 6, 8, 10, 12, 20].includes(targetSides)) return;
    select.value = String(targetSides);
  }

  function getDamageDiceLabel(sides){
    const nextSides = [4, 6, 8, 10, 12, 20].includes(toInt(sides)) ? toInt(sides) : 20;
    return nextSides === 10 ? "d4+d6" : `d${nextSides}`;
  }

  function setDamageDiceSidesInUi(sides, options = {}){
    const select = $("damageDiceSides") || $("diceSides");
    if(!select) return false;
    const nextSides = normalizeDamageDiceSides(sides, 6);
    select.value = String(nextSides);
    if(options && options.resetAutoType){
      lastAutoDamageDiceAttackType = "";
    }
    if(options && options.updateDiceShape && ensureDice3dReady()){
      setDiceShape(nextSides);
    }
    return true;
  }

  function randDice(sides){
    return Math.floor(Math.random() * sides) + 1;
  }

  function rollValueBySides(sides){
    const nextSides = [4, 6, 8, 10, 12, 20].includes(toInt(sides)) ? toInt(sides) : 20;
    if(nextSides === 10){
      return randDice(4) + randDice(6);
    }
    return randDice(nextSides);
  }

  function getDeterministicRollPartsBySeed(sides, seedRaw){
    const nextSides = [4, 6, 8, 10, 12, 20].includes(toInt(sides)) ? toInt(sides) : 20;
    const seed = toSeedInt(seedRaw, Math.floor(Math.random() * 2147483646) + 1);
    const rng = createSeededRng(seed);
    if(nextSides === 10){
      return [
        clamp(Math.floor(rng() * 4) + 1, 1, 4),
        clamp(Math.floor(rng() * 6) + 1, 1, 6)
      ];
    }
    return [clamp(Math.floor(rng() * nextSides) + 1, 1, nextSides)];
  }

  function getDeterministicRollValueBySeed(sides, seedRaw){
    const nextSides = [4, 6, 8, 10, 12, 20].includes(toInt(sides)) ? toInt(sides) : 20;
    const parts = getDeterministicRollPartsBySeed(nextSides, seedRaw);
    if(nextSides === 10){
      return clamp(toInt(parts[0]) + toInt(parts[1]), 2, 10);
    }
    return clamp(toInt(parts[0]), 1, nextSides);
  }

  function judge(sum, target){
    if(sum >= target) return { label: "성공", cls: "good" };
    if(sum >= target - 2) return { label: "아슬아슬 실패", cls: "warn" };
    return { label: "실패", cls: "bad" };
  }

  function disposeThreeObject(object3d){
    if(!object3d) return;
    object3d.traverse((node) => {
      if(node.geometry && typeof node.geometry.dispose === "function"){
        node.geometry.dispose();
      }
      if(node.material){
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        for(const mat of mats){
          if(mat && mat.map && typeof mat.map.dispose === "function"){
            mat.map.dispose();
          }
          if(mat && typeof mat.dispose === "function"){
            mat.dispose();
          }
        }
      }
    });
  }

  function buildD10GeometryData(three){
    const top = new three.Vector3(0, 1.58, 0);
    const bottom = new three.Vector3(0, -1.58, 0);
    const upperY = 0.42;
    const lowerY = -0.42;
    const ringRadius = 1.04;
    const upper = [];
    const lower = [];

    for(let i = 0; i < 5; i += 1){
      const upperAngle = (Math.PI * 2 * i) / 5;
      const lowerAngle = upperAngle + (Math.PI / 5);
      upper.push(new three.Vector3(
        Math.cos(upperAngle) * ringRadius,
        upperY,
        Math.sin(upperAngle) * ringRadius
      ));
      lower.push(new three.Vector3(
        Math.cos(lowerAngle) * ringRadius,
        lowerY,
        Math.sin(lowerAngle) * ringRadius
      ));
    }

    const positions = [];
    const faceData = [];
    const pushTriangle = (a, b, c) => {
      positions.push(
        a.x, a.y, a.z,
        b.x, b.y, b.z,
        c.x, c.y, c.z
      );
    };

    const pushFaceQuad = (p0, p1, p2, p3, value) => {
      let v0 = p0;
      let v1 = p1;
      let v2 = p2;
      let v3 = p3;
      const center = p0.clone().add(p1).add(p2).add(p3).multiplyScalar(0.25);
      const normal = p1.clone().sub(p0).cross(p3.clone().sub(p0));
      if(normal.dot(center) < 0){
        v0 = p0;
        v1 = p3;
        v2 = p2;
        v3 = p1;
        normal.multiplyScalar(-1);
      }
      pushTriangle(v0, v1, v3);
      pushTriangle(v1, v2, v3);
      faceData.push({
        value,
        center: center.clone(),
        normal: normal.normalize()
      });
    };

    let value = 1;
    for(let i = 0; i < 5; i += 1){
      const ui = upper[i];
      const li = lower[i];
      const un = upper[(i + 1) % 5];
      pushFaceQuad(top, ui, bottom, li, value);
      value += 1;
      pushFaceQuad(top, li, bottom, un, value);
      value += 1;
    }

    const geometry = new three.BufferGeometry();
    geometry.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return { geometry, faceData };
  }

  function getDieGeometry(three, sides){
    const detail = 0;
    if(sides === 4) return new three.TetrahedronGeometry(1.24, detail);
    if(sides === 6) return new three.BoxGeometry(1.92, 1.92, 1.92);
    if(sides === 8) return new three.OctahedronGeometry(1.34, detail);
    if(sides === 10) return buildD10GeometryData(three).geometry;
    if(sides === 12) return new three.DodecahedronGeometry(1.26, detail);
    return new three.IcosahedronGeometry(1.32, detail);
  }

  function createDeskTexture(three){
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if(!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, "#e7d6ad");
    grad.addColorStop(0.45, "#dcc28f");
    grad.addColorStop(1, "#c8a86f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for(let i = 0; i < 1600; i += 1){
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = 0.025 + (Math.random() * 0.05);
      const tone = Math.random() > 0.5 ? "70,46,24" : "251,243,214";
      ctx.fillStyle = `rgba(${tone},${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const tex = new three.CanvasTexture(canvas);
    tex.wrapS = three.RepeatWrapping;
    tex.wrapT = three.RepeatWrapping;
    tex.repeat.set(3.4, 2.8);
    return tex;
  }

  function createFaceNumberTexture(three, value, appearanceRaw){
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if(!ctx) return null;
    const appearance = normalizeDiceAppearance(appearanceRaw || {});

    ctx.clearRect(0, 0, 1024, 1024);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = String(value);
    const fontSize = text.length >= 2 ? 520 : 612;
    ctx.font = `900 ${fontSize}px "Noto Sans KR", "Segoe UI", sans-serif`;
    ctx.lineJoin = "round";
    ctx.lineWidth = text.length >= 2 ? 42 : 38;
    const outlineRgb = hexToRgb(appearance.textOutline);
    const textRgb = hexToRgb(appearance.textColor);
    ctx.strokeStyle = `rgba(${outlineRgb.r}, ${outlineRgb.g}, ${outlineRgb.b}, 0.99)`;
    ctx.fillStyle = `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.99)`;
    ctx.shadowColor = "rgba(0, 0, 0, 0)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeText(text, 512, 536);
    ctx.fillText(text, 512, 536);

    const tex = new three.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    if("LinearFilter" in three) tex.minFilter = three.LinearFilter;
    if("LinearFilter" in three) tex.magFilter = three.LinearFilter;
    if("SRGBColorSpace" in three){
      tex.colorSpace = three.SRGBColorSpace;
    }else if("sRGBEncoding" in three){
      tex.encoding = three.sRGBEncoding;
    }
    const maxAniso = (dice3d && dice3d.renderer && dice3d.renderer.capabilities && dice3d.renderer.capabilities.getMaxAnisotropy)
      ? dice3d.renderer.capabilities.getMaxAnisotropy()
      : 1;
    tex.anisotropy = Math.max(1, Math.min(12, maxAniso));
    tex.needsUpdate = true;
    return tex;
  }

  function createDieSurfaceTexture(three, textureStyleRaw){
    const textureStyle = DICE_TEXTURE_STYLES.includes(String(textureStyleRaw || ""))
      ? String(textureStyleRaw)
      : "clean";
    if(textureStyle === "clean") return null;

    const canvas = document.createElement("canvas");
    const size = textureStyle === "metal" ? 1024 : 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if(!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    if(textureStyle === "metal"){
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#c9cfd6");
      grad.addColorStop(0.45, "#9ea8b2");
      grad.addColorStop(1, "#7b858f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      for(let i = 0; i < 7600; i += 1){
        const x = Math.random() * size;
        const y = Math.random() * size;
        const v = 120 + Math.floor(Math.random() * 120);
        const a = 0.016 + (Math.random() * 0.045);
        ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${a.toFixed(3)})`;
        ctx.fillRect(x, y, 1, 1);
      }

      for(let i = 0; i < 1200; i += 1){
        const y = Math.random() * size;
        const len = (size * 0.26) + (Math.random() * size * 0.42);
        const x = Math.random() * size;
        const drift = (Math.random() - 0.5) * 7;
        const alpha = 0.03 + (Math.random() * 0.05);
        const light = Math.random() > 0.5;
        const tone = light ? "230,236,244" : "70,82,96";
        ctx.strokeStyle = `rgba(${tone}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7 + Math.random() * 1.3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y + drift);
        ctx.stroke();
      }
    }else{
      const grainCount = textureStyle === "worn" ? 2300 : 1400;
      const grainAlpha = textureStyle === "worn" ? 0.06 : 0.04;
      for(let i = 0; i < grainCount; i += 1){
        const x = Math.random() * size;
        const y = Math.random() * size;
        const v = 130 + Math.floor(Math.random() * 70);
        ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${grainAlpha.toFixed(3)})`;
        ctx.fillRect(x, y, 1, 1);
      }
      if(textureStyle === "worn"){
        for(let i = 0; i < 42; i += 1){
          const x = Math.random() * size;
          const y = Math.random() * size;
          const len = 18 + Math.random() * 44;
          const angle = Math.random() * Math.PI * 2;
          ctx.strokeStyle = `rgba(90, 72, 48, ${(0.05 + Math.random() * 0.07).toFixed(3)})`;
          ctx.lineWidth = 1 + Math.random() * 1.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
          ctx.stroke();
        }
      }
    }

    const tex = new three.CanvasTexture(canvas);
    tex.wrapS = three.RepeatWrapping;
    tex.wrapT = three.RepeatWrapping;
    tex.repeat.set(textureStyle === "metal" ? 1.15 : 1.4, textureStyle === "metal" ? 1.15 : 1.4);
    tex.generateMipmaps = true;
    if("LinearMipmapLinearFilter" in three) tex.minFilter = three.LinearMipmapLinearFilter;
    if("LinearFilter" in three) tex.magFilter = three.LinearFilter;
    const maxAniso = (dice3d && dice3d.renderer && dice3d.renderer.capabilities && dice3d.renderer.capabilities.getMaxAnisotropy)
      ? dice3d.renderer.capabilities.getMaxAnisotropy()
      : 1;
    tex.anisotropy = Math.max(1, Math.min(textureStyle === "metal" ? 12 : 8, maxAniso));
    tex.needsUpdate = true;
    return tex;
  }

  function getFaceLabelSize(radius, sides){
    const scaleMap = {
      4: 1.0,
      6: 0.78,
      8: 0.72,
      10: 0.66,
      12: 0.62,
      20: 0.52
    };
    const scale = scaleMap[sides] || 0.5;
    return Math.max(0.34, radius * scale);
  }

  function getDieVisualScale(sides){
    const scaleMap = {
      4: 1.38,
      6: 1.34,
      8: 1.36,
      10: 1.34,
      12: 1.34,
      20: 1.38
    };
    return scaleMap[sides] || 1.35;
  }

  function buildFaceNumberGroup(three, faceData, radius, sides, appearanceRaw){
    if(!Array.isArray(faceData) || faceData.length === 0) return null;
    const group = new three.Group();
    const labelSize = getFaceLabelSize(radius, sides);
    const normalAxis = new three.Vector3(0, 0, 1);

    for(const face of faceData){
      const tex = createFaceNumberTexture(three, face.value, appearanceRaw);
      if(!tex) continue;
      tex.needsUpdate = true;
      const mat = new three.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: three.DoubleSide,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        depthWrite: false,
        depthTest: true,
        alphaTest: 0.34
      });
      const mesh = new three.Mesh(new three.PlaneGeometry(labelSize, labelSize), mat);
      const normal = face.normal.clone().normalize();
      mesh.position.copy(face.center).addScaledVector(normal, 0.055);
      mesh.quaternion.setFromUnitVectors(normalAxis, normal);
      face.labelUp = new three.Vector3(0, 1, 0).applyQuaternion(mesh.quaternion).normalize();
      mesh.renderOrder = 4;
      group.add(mesh);
    }

    return group.children.length > 0 ? group : null;
  }

  function clusterFaceTrianglesByNormal(three, triangles, targetCount){
    if(!Array.isArray(triangles) || triangles.length === 0) return [];
    if(targetCount <= 0) return [];

    const thresholds = [0.999999, 0.99999, 0.9999, 0.999, 0.998, 0.995, 0.99, 0.985];
    let best = [];
    let bestDiff = Number.POSITIVE_INFINITY;

    for(const threshold of thresholds){
      const groups = [];
      for(const tri of triangles){
        let hit = null;
        for(const group of groups){
          if(group.normal.dot(tri.normal) >= threshold){
            hit = group;
            break;
          }
        }
        if(hit){
          hit.center.add(tri.center);
          hit.normal.add(tri.normal).normalize();
          hit.count += 1;
        }else{
          groups.push({
            center: tri.center.clone(),
            normal: tri.normal.clone(),
            count: 1
          });
        }
      }

      const normalized = groups.map((group) => {
        const center = group.center.multiplyScalar(1 / Math.max(1, group.count));
        const normal = group.normal.clone().normalize();
        return { center, normal };
      });
      const diff = Math.abs(normalized.length - targetCount);
      if(diff < bestDiff){
        best = normalized;
        bestDiff = diff;
      }
      if(diff === 0) return normalized;
    }

    return best;
  }

  function buildDieFaceData(three, geometry, sides){
    if(!geometry || typeof geometry.getAttribute !== "function") return [];

    const triGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
    const pos = triGeometry.getAttribute("position");
    if(!pos){
      if(triGeometry !== geometry && typeof triGeometry.dispose === "function"){
        triGeometry.dispose();
      }
      return [];
    }

    const a = new three.Vector3();
    const b = new three.Vector3();
    const c = new three.Vector3();
    const edge1 = new three.Vector3();
    const edge2 = new three.Vector3();
    const normal = new three.Vector3();
    const center = new three.Vector3();
    const triangles = [];

    for(let i = 0; i + 2 < pos.count; i += 3){
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      edge1.subVectors(b, a);
      edge2.subVectors(c, a);
      normal.crossVectors(edge1, edge2);
      const lenSq = normal.lengthSq();
      if(lenSq < 1e-10) continue;

      normal.multiplyScalar(1 / Math.sqrt(lenSq));
      center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      if(normal.dot(center) < 0){
        normal.multiplyScalar(-1);
      }
      triangles.push({
        center: center.clone(),
        normal: normal.clone()
      });
    }

    if(triGeometry !== geometry && typeof triGeometry.dispose === "function"){
      triGeometry.dispose();
    }

    if(triangles.length === 0) return [];

    let faces = clusterFaceTrianglesByNormal(three, triangles, sides);
    if(faces.length !== sides && triangles.length === sides){
      faces = triangles.map((tri) => ({ center: tri.center.clone(), normal: tri.normal.clone() }));
    }
    if(faces.length !== sides){
      faces = triangles.slice(0, sides).map((tri) => ({ center: tri.center.clone(), normal: tri.normal.clone() }));
    }

    faces.sort((fa, fb) => {
      const yDiff = fb.center.y - fa.center.y;
      if(Math.abs(yDiff) > 1e-5) return yDiff;
      const azA = Math.atan2(fa.center.z, fa.center.x);
      const azB = Math.atan2(fb.center.z, fb.center.x);
      if(Math.abs(azA - azB) > 1e-5) return azA - azB;
      return fb.center.x - fa.center.x;
    });

    return faces.map((face, index) => ({
      value: index + 1,
      center: face.center.clone(),
      normal: face.normal.clone().normalize()
    }));
  }

  function orientDieToValue(die, value, options = {}){
    if(!dice3d || !dice3d.ready || !die) return false;
    const faceData = Array.isArray(options && options.faceData) && options.faceData.length > 0
      ? options.faceData
      : (Array.isArray(dice3d.faceData) ? dice3d.faceData : []);
    if(faceData.length === 0) return false;
    const targetFace = faceData.find((face) => face.value === value);
    if(!targetFace) return false;

    const three = dice3d.three;
    const worldUp = new three.Vector3(0, 1, 0);
    const absolute = !!(options && options.absolute);
    if(absolute){
      const targetNormal = targetFace.normal.clone().normalize();
      die.quaternion.copy(new three.Quaternion().setFromUnitVectors(targetNormal, worldUp));
    }else{
      const worldNormal = targetFace.normal.clone().applyQuaternion(die.quaternion).normalize();
      const alignQ = new three.Quaternion().setFromUnitVectors(worldNormal, worldUp);
      die.quaternion.premultiply(alignQ);
    }

    const randomYaw = !!(options && options.randomYaw);
    const keepLabelUpright = options && options.keepLabelUpright !== false;
    if(keepLabelUpright && targetFace.labelUp){
      // Align the label's "up" vector to screen-up direction on top-down camera.
      const worldLabelUp = targetFace.labelUp.clone().applyQuaternion(die.quaternion);
      const current2d = worldLabelUp.clone();
      current2d.y = 0;
      const target2d = new three.Vector3(0, 0, -1);
      target2d.y = 0;
      if(current2d.lengthSq() > 1e-6 && target2d.lengthSq() > 1e-6){
        current2d.normalize();
        target2d.normalize();
        const crossY = (current2d.z * target2d.x) - (current2d.x * target2d.z);
        const dot = clamp(current2d.dot(target2d), -1, 1);
        const yawToUpright = Math.atan2(crossY, dot);
        const uprightQ = new three.Quaternion().setFromAxisAngle(worldUp, yawToUpright);
        die.quaternion.premultiply(uprightQ);
      }
    }
    if(randomYaw){
      const yawQ = new three.Quaternion().setFromAxisAngle(worldUp, (Math.random() - 0.5) * Math.PI * 2);
      die.quaternion.premultiply(yawQ);
    }
    die.rotation.setFromQuaternion(die.quaternion);
    return true;
  }

  function getTopFaceValueFromDie(die, options = {}){
    const faceData = Array.isArray(options && options.faceData) && options.faceData.length > 0
      ? options.faceData
      : (Array.isArray(dice3d && dice3d.faceData) ? dice3d.faceData : []);
    if(!dice3d || !dice3d.ready || !die || faceData.length === 0){
      return null;
    }
    const worldUp = new dice3d.three.Vector3(0, 1, 0);
    let bestValue = null;
    let bestDot = -Infinity;
    for(const face of faceData){
      const worldNormal = face.normal.clone().applyQuaternion(die.quaternion).normalize();
      const dot = worldNormal.dot(worldUp);
      if(dot > bestDot){
        bestDot = dot;
        bestValue = face.value;
      }
    }
    return toInt(bestValue);
  }

  function renderDice3d(){
    if(!dice3d || !dice3d.ready) return;
    dice3d.renderer.render(dice3d.scene, dice3d.camera);
  }

  function applyDiceCameraMode(mode = "panel"){
    if(!dice3d || !dice3d.ready) return;
    const camera = dice3d.camera;
    if(mode === "overlay"){
      camera.up.set(0, 0, -1);
      camera.fov = 38;
      camera.position.set(0, 11.2, 0.01);
      camera.lookAt(0, 0, 0);
    }else{
      // Keep a top-down camera in the dice panel itself (no separate fullscreen board).
      camera.up.set(0, 0, -1);
      camera.fov = 37;
      camera.position.set(0, 9.2, 0.01);
      camera.lookAt(0, 0, 0);
    }
    camera.updateProjectionMatrix();
  }

  function getDiceRenderHost(){
    if(!dice3d || !dice3d.ready) return null;
    return dice3d.viewport || null;
  }

  function setDiceOverlayActive(active){
    if(!dice3d || !dice3d.ready) return;
    // Overlay mode is disabled: always render inside the panel viewport.
    const shouldUseOverlay = false;
    if(dice3d.overlayActive !== shouldUseOverlay){
      dice3d.overlayActive = shouldUseOverlay;
    }
    const nextHost = getDiceRenderHost();
    if(!nextHost) return;

    if(dice3d.overlayEl){
      dice3d.overlayEl.classList.remove("active");
      dice3d.overlayEl.setAttribute("aria-hidden", "true");
    }
    nextHost.appendChild(dice3d.renderer.domElement);
    applyDiceCameraMode("panel");
    resizeDice3d();
  }

  function resizeDice3d(){
    if(!dice3d || !dice3d.ready) return;
    const host = getDiceRenderHost();
    if(!host) return;
    const rect = host.getBoundingClientRect();
    const width = Math.max(180, Math.floor(rect.width));
    const height = Math.max(140, Math.floor(rect.height));
    dice3d.renderer.setSize(width, height, false);
    dice3d.camera.aspect = width / Math.max(1, height);
    dice3d.camera.updateProjectionMatrix();
    renderDice3d();
  }

  function setDiceShape(sides, options = {}){
    if(!dice3d || !dice3d.ready) return;
    const forceRebuild = !!(options && options.forceRebuild);
    const nextSides = [4, 6, 8, 10, 12, 20].includes(sides) ? sides : 20;
    const appearance = getDiceAppearance();
    const appearanceKey = [
      appearance.bodyColor,
      appearance.edgeColor,
      appearance.textColor,
      appearance.textOutline,
      appearance.roughness,
      appearance.metalness,
      appearance.textureStyle
    ].join("|");
    if(dice3d.dieGroup && dice3d.currentSides === nextSides && !forceRebuild && dice3d.appearanceKey === appearanceKey) return;

    if(dice3d.dieGroup){
      dice3d.scene.remove(dice3d.dieGroup);
      disposeThreeObject(dice3d.dieGroup);
      dice3d.dieGroup = null;
      dice3d.faceData = [];
      dice3d.diceActors = [];
    }

    const three = dice3d.three;
    const root = new three.Group();
    const actorSides = nextSides === 10 ? [4, 6] : [nextSides];
    const isMetalStyle = appearance.textureStyle === "metal";
    const BodyMaterialCtor = (typeof three.MeshPhysicalMaterial === "function")
      ? three.MeshPhysicalMaterial
      : three.MeshStandardMaterial;
    const actorData = [];

    for(const actorSidesValue of actorSides){
      const geometry = getDieGeometry(three, actorSidesValue);
      const dieScale = nextSides === 10 ? 0.9 : 1;
      const visualScale = getDieVisualScale(actorSidesValue) * dieScale;
      if(Math.abs(visualScale - 1) > 1e-3){
        geometry.scale(visualScale, visualScale, visualScale);
      }
      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 1.2;
      const faceData = buildDieFaceData(three, geometry, actorSidesValue);
      const surfaceTex = createDieSurfaceTexture(three, appearance.textureStyle);

      const roughnessBase = clamp(appearance.roughness, 0, 100) / 100;
      const metalnessBase = clamp(appearance.metalness, 0, 100) / 100;
      const bodyParams = {
        color: appearance.bodyColor,
        map: surfaceTex || null,
        roughness: isMetalStyle ? Math.max(0.12, roughnessBase * 0.7) : roughnessBase,
        metalness: isMetalStyle ? Math.max(0.65, metalnessBase) : metalnessBase,
        flatShading: true
      };
      if(BodyMaterialCtor === three.MeshPhysicalMaterial){
        bodyParams.clearcoat = isMetalStyle ? 0.68 : 0.12;
        bodyParams.clearcoatRoughness = isMetalStyle ? 0.18 : 0.56;
        bodyParams.envMapIntensity = isMetalStyle ? 1.15 : 0.95;
      }
      const bodyMat = new BodyMaterialCtor(bodyParams);
      const body = new three.Mesh(geometry, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;

      const edge = new three.LineSegments(
        new three.EdgesGeometry(geometry),
        new three.LineBasicMaterial({ color: appearance.edgeColor, transparent: true, opacity: 0.78 })
      );

      const group = new three.Group();
      group.add(body);
      group.add(edge);
      const labelGroup = buildFaceNumberGroup(three, faceData, radius, actorSidesValue, appearance);
      if(labelGroup){
        group.add(labelGroup);
      }
      group.position.set(0, radius + 0.02, 0);
      root.add(group);
      actorData.push({
        group,
        sides: actorSidesValue,
        radius,
        faceData,
        offsetX: 0
      });
    }

    if(actorData.length === 2){
      const spacing = (actorData[0].radius + actorData[1].radius) * 0.92;
      actorData[0].offsetX = -spacing * 0.5;
      actorData[1].offsetX = spacing * 0.5;
    }
    for(const actor of actorData){
      actor.group.position.x = actor.offsetX || 0;
    }

    dice3d.scene.add(root);
    dice3d.currentSides = nextSides;
    dice3d.radius = actorData.reduce((max, actor) => Math.max(max, actor.radius || 0), 1.2);
    dice3d.dieGroup = root;
    dice3d.faceData = actorData[0] && Array.isArray(actorData[0].faceData) ? actorData[0].faceData : [];
    dice3d.diceActors = actorData;
    dice3d.appearanceKey = appearanceKey;
    renderDice3d();
  }

  function ensureDice3dReady(){
    if(dice3d && dice3d.ready) return true;
    if(typeof window.THREE !== "object"){
      const sub = $("diceSub");
      if(sub) sub.textContent = "3D 엔진 로드 실패 (로컬/네트워크 확인)";
      return false;
    }

    const viewport = $("dice3dViewport");
    if(!viewport) return false;
    const overlayEl = $("diceRollOverlay");

    const three = window.THREE;
    const renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(3, Math.max(2, window.devicePixelRatio || 1)));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = three.PCFSoftShadowMap;
    viewport.innerHTML = "";
    viewport.appendChild(renderer.domElement);

    const scene = new three.Scene();
    scene.background = null;
    scene.fog = null;

    const camera = new three.PerspectiveCamera(35, 1, 0.1, 140);
    camera.position.set(0, 5.4, 10.6);
    camera.lookAt(0, 1.2, 0);

    const hemi = new three.HemisphereLight(0xf4e2bc, 0x2d1a0a, 0.98);
    scene.add(hemi);
    const key = new three.DirectionalLight(0xfff2cf, 1.1);
    key.position.set(12.8, 17.2, 9.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new three.DirectionalLight(0xd5a869, 0.34);
    fill.position.set(-8.2, 7.6, -4.4);
    scene.add(fill);
    const rim = new three.DirectionalLight(0xe9f2ff, 0.42);
    rim.position.set(-3.2, 5.8, 9.8);
    scene.add(rim);

    dice3d = {
      ready: true,
      three,
      viewport,
      overlayEl,
      overlayActive: false,
      renderer,
      scene,
      camera,
      desk: null,
      wall: null,
      dieGroup: null,
      diceActors: [],
      faceData: [],
      radius: 1.2,
      currentSides: 0,
      appearanceKey: "",
      frameId: null
    };

    applyDiceCameraMode("panel");
    setDiceShape(20);
    resizeDice3d();

    const face = $("diceFace");
    if(face) face.classList.add("fallbackHidden");

    if(dice3dResizeObserver && typeof dice3dResizeObserver.disconnect === "function"){
      dice3dResizeObserver.disconnect();
    }
    if(typeof ResizeObserver === "function"){
      dice3dResizeObserver = new ResizeObserver(() => resizeDice3d());
      dice3dResizeObserver.observe(viewport);
      if(overlayEl) dice3dResizeObserver.observe(overlayEl);
    }

    return true;
  }

  async function animateRollFallback(finalValue, sides){
    const wrap = $("diceWrap");
    const face = $("diceFace");
    const sub = $("diceSub");

    wrap.classList.add("rolling");
    sub.textContent = `${getDamageDiceLabel(sides)} 굴리는 중...`;

    const start = performance.now();
    const duration = 980;

    return new Promise((resolve) => {
      const tick = (t) => {
        const p = Math.min(1, (t - start) / duration);
        if(p < 1){
          face.textContent = String(rollValueBySides(sides));
          requestAnimationFrame(tick);
        }else{
          face.textContent = String(finalValue);
          wrap.classList.remove("rolling");
          sub.textContent = `${getDamageDiceLabel(sides)} 결과 확정`;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  async function animateRoll3d(sides, options = {}){
    if(!ensureDice3dReady()) return false;

    const three = dice3d.three;
    const appearance = getDiceAppearance();
    const rollDurationMs = clamp(
      toInt(appearance.rollDurationMs || DICE_ROLL_DURATION_DEFAULT_MS),
      DICE_ROLL_DURATION_MIN_MS,
      DICE_ROLL_DURATION_MAX_MS
    );
    const powerScale = clamp(toInt(appearance.rollPower || 150), 70, 250) / 100;
    const seed = toSeedInt(options && options.seed, Math.floor(Math.random() * 2147483646) + 1);
    const rng = createSeededRng(seed);
    setDiceOverlayActive(false);
    setDiceShape(sides);
    const actors = Array.isArray(dice3d.diceActors) ? dice3d.diceActors : [];
    if(actors.length === 0){
      return false;
    }

    const throwState = {
      startedAt: performance.now(),
      lastTs: 0,
      stableMs: 0,
      holdMs: 0,
      landed: false
    };
    const actorStates = actors.map((actor, index) => {
      const radius = Math.max(0.8, Number(actor.radius) || 1.2);
      const floorY = radius + 0.02;
      const angularBoost = 1 + (index * 0.06);
      const angular = new three.Vector3(
        (rng() > 0.5 ? 1 : -1) * (14 + rng() * 9) * powerScale * angularBoost,
        (rng() > 0.5 ? 1 : -1) * (16 + rng() * 11) * powerScale * angularBoost,
        (rng() > 0.5 ? 1 : -1) * (13 + rng() * 8) * powerScale * angularBoost
      );
      actor.group.position.set(actor.offsetX || 0, floorY, 0);
      actor.group.rotation.set(
        rng() * Math.PI * 2,
        rng() * Math.PI * 2,
        rng() * Math.PI * 2
      );
      return {
        actor,
        floorY,
        wobbleSeed: rng() * Math.PI * 2,
        angular
      };
    });

    if(dice3d.frameId){
      cancelAnimationFrame(dice3d.frameId);
      dice3d.frameId = null;
    }

    return new Promise((resolve) => {
      const deterministicParts = getDeterministicRollPartsBySeed(sides, seed);
      const finalize = () => {
        const resolvedParts = [];
        const settleTargets = [];
        for(let index = 0; index < actorStates.length; index += 1){
          const stateItem = actorStates[index];
          stateItem.angular.set(0, 0, 0);
          stateItem.actor.group.position.y = stateItem.floorY;
          const fallbackPart = deterministicParts.length > 0
            ? deterministicParts[Math.min(index, deterministicParts.length - 1)]
            : 1;
          const resolvedFaceValue = clamp(toInt(fallbackPart), 1, stateItem.actor.sides);
          resolvedParts.push(resolvedFaceValue);

          // Show the same deterministic result on every client (same seed), regardless of local frame timing.
          const fromQ = stateItem.actor.group.quaternion.clone();
          const aligned = orientDieToValue(stateItem.actor.group, resolvedFaceValue, {
            absolute: true,
            randomYaw: false,
            faceData: stateItem.actor.faceData
          });
          if(aligned){
            const toQ = stateItem.actor.group.quaternion.clone();
            stateItem.actor.group.quaternion.copy(fromQ);
            stateItem.actor.group.rotation.setFromQuaternion(fromQ);
            settleTargets.push({
              group: stateItem.actor.group,
              fromQ,
              toQ
            });
          }
        }
        const resolvedValue = (sides === 10 && resolvedParts.length >= 2)
          ? clamp(toInt(resolvedParts[0]) + toInt(resolvedParts[1]), 2, 10)
          : clamp(toInt(resolvedParts[0] || rollValueBySides(sides)), 1, sides);
        if(settleTargets.length <= 0){
          renderDice3d();
          dice3d.frameId = null;
          resolve(resolvedValue);
          return;
        }

        const settleStart = performance.now();
        const settleDuration = 170;
        const settleTick = (ts) => {
          const t = clamp((ts - settleStart) / settleDuration, 0, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          for(const target of settleTargets){
            target.group.quaternion.copy(target.fromQ);
            target.group.quaternion.slerp(target.toQ, ease);
            target.group.rotation.setFromQuaternion(target.group.quaternion);
          }
          renderDice3d();
          if(t < 1){
            dice3d.frameId = requestAnimationFrame(settleTick);
            return;
          }
          dice3d.frameId = null;
          resolve(resolvedValue);
        };
        dice3d.frameId = requestAnimationFrame(settleTick);
      };

      const tick = (now) => {
        const dt = Math.min(0.033, (now - (throwState.lastTs || now)) / 1000);
        throwState.lastTs = now;
        const elapsed = now - throwState.startedAt;
        const durationRange = Math.max(1, DICE_ROLL_DURATION_MAX_MS - DICE_ROLL_DURATION_MIN_MS);
        const dampBase = clamp(
          0.964 + ((rollDurationMs - DICE_ROLL_DURATION_MIN_MS) / durationRange) * 0.022,
          0.964,
          0.986
        );
        const angularDamp = Math.pow(dampBase, dt * 60);
        let spin = 0;
        let nearFloor = true;

        for(const stateItem of actorStates){
          const die = stateItem.actor.group;
          die.rotation.x += stateItem.angular.x * dt;
          die.rotation.y += stateItem.angular.y * dt;
          die.rotation.z += stateItem.angular.z * dt;

          const wobbleAmp = throwState.landed ? 0 : (0.14 * Math.exp(-elapsed / 540));
          if(wobbleAmp > 0.002){
            die.position.y = stateItem.floorY + Math.abs(Math.sin((elapsed * 0.017) + stateItem.wobbleSeed)) * wobbleAmp;
          }else{
            die.position.y = stateItem.floorY;
          }

          stateItem.angular.multiplyScalar(angularDamp);
          spin = Math.max(spin, stateItem.angular.length());
          nearFloor = nearFloor && (Math.abs(die.position.y - stateItem.floorY) < 0.018);
        }

        renderDice3d();

        if(!throwState.landed){
          const settleStartMs = Math.max(580, Math.floor(rollDurationMs * 0.66));
          const forcedStopMs = Math.max(1700, rollDurationMs + 700);
          const settleSpinThreshold = clamp(0.32 * Math.max(0.85, powerScale * 0.9), 0.28, 0.62);
          const stableSpinThreshold = Math.max(0.18, settleSpinThreshold * 0.72);
          if(elapsed > settleStartMs && spin < stableSpinThreshold && nearFloor){
            throwState.stableMs += dt * 1000;
          }else{
            throwState.stableMs = 0;
          }
          if(throwState.stableMs >= 220){
            for(const stateItem of actorStates){
              stateItem.actor.group.position.y = stateItem.floorY;
              stateItem.angular.set(0, 0, 0);
            }
            throwState.landed = true;
            throwState.holdMs = 0;
            renderDice3d();
          }else if(elapsed > forcedStopMs){
            for(const stateItem of actorStates){
              stateItem.actor.group.position.y = stateItem.floorY;
              stateItem.angular.set(0, 0, 0);
            }
            throwState.landed = true;
            throwState.holdMs = 0;
            renderDice3d();
          }
        }else{
          throwState.holdMs += dt * 1000;
          if(throwState.holdMs >= 140){
            finalize();
            return;
          }
        }

        dice3d.frameId = requestAnimationFrame(tick);
      };
      dice3d.frameId = requestAnimationFrame(tick);
    });
  }

  async function animateRoll(sides, options = {}){
    rolling = true;

    const sub = $("diceSub");
    sub.textContent = `${getDamageDiceLabel(sides)} 굴리는 중...`;
    const seed = toSeedInt(options && options.seed, Math.floor(Math.random() * 2147483646) + 1);
    const deterministicValue = getDeterministicRollValueBySeed(sides, seed);

    const used3d = await animateRoll3d(sides, { seed });
    if(used3d !== false){
      sub.textContent = `${getDamageDiceLabel(sides)} 결과 확정`;
      rolling = false;
      return clamp(toInt(used3d), 1, sides);
    }

    await animateRollFallback(deterministicValue, sides);
    rolling = false;
    return clamp(toInt(deterministicValue), 1, sides);
  }

  function markRollSyncSeen(syncId){
    const id = safeText(syncId || "", 80);
    if(!id) return false;
    const now = Date.now();
    const existed = rollSyncSeen.has(id);
    rollSyncSeen.set(id, now);
    if(rollSyncSeen.size > 360){
      const expireBefore = now - 120000;
      for(const [key, ts] of rollSyncSeen){
        if(ts < expireBefore) rollSyncSeen.delete(key);
      }
      while(rollSyncSeen.size > 240){
        const firstKey = rollSyncSeen.keys().next().value;
        if(!firstKey) break;
        rollSyncSeen.delete(firstKey);
      }
    }
    return existed;
  }

  function requestSynchronizedRoll(kind, sides){
    const nextSides = [4, 6, 8, 10, 12, 20].includes(toInt(sides)) ? toInt(sides) : 20;
    const seed = toSeedInt(Math.floor(Math.random() * 2147483646) + 1, 1);
    if(!socket || !socket.connected || normalizeRoomId(joinedRoomId) !== getRoomId()){
      return animateRoll(nextSides, { seed });
    }

    const syncId = makeId("rollsync");
    const roomId = getRoomId();
    const userSlot = isAdminRole() ? state.activePc : getUserSlot();
    const startAt = Date.now() + 16;
    const fallbackTimeoutMs = Math.max(
      2400,
      clamp(
        toInt(getDiceAppearance().rollDurationMs || DICE_ROLL_DURATION_DEFAULT_MS),
        DICE_ROLL_DURATION_MIN_MS,
        DICE_ROLL_DURATION_MAX_MS
      ) + 1500
    );

    return new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        if(!rollSyncPending.has(syncId)) return;
        rollSyncPending.delete(syncId);
        const fallback = await animateRoll(nextSides, { seed });
        resolve(clamp(toInt(fallback), 1, nextSides));
      }, fallbackTimeoutMs);

      rollSyncPending.set(syncId, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(clamp(toInt(value), 1, nextSides));
        }
      });

      // Start local roll immediately with the same sync payload to remove network round-trip delay.
      handleIncomingRollSync({
        roomId,
        syncId,
        kind: kind === "damage" ? "damage" : "hit",
        sides: nextSides,
        seed,
        startAt
      });

      socket.emit("roll_sync", {
        roomId,
        userSlot,
        kind: kind === "damage" ? "damage" : "hit",
        sides: nextSides,
        seed,
        startAt,
        syncId
      });
    });
  }

  function handleIncomingRollSync(payload){
    const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : "");
    if(!roomId || roomId !== getRoomId()) return;
    const syncId = safeText(payload && payload.syncId ? payload.syncId : "", 80);
    if(syncId && markRollSyncSeen(syncId)) return;
    const sides = [4, 6, 8, 10, 12, 20].includes(toInt(payload && payload.sides)) ? toInt(payload.sides) : 20;
    const seed = toSeedInt(payload && payload.seed, Math.floor(Math.random() * 2147483646) + 1);
    const actor = safeText(payload && payload.actor ? payload.actor : "", 28);
    const now = Date.now();
    const startAt = clamp(toInt(payload && payload.startAt), now, now + 1800);

    rollSyncQueue = rollSyncQueue.then(async () => {
      const waitMs = clamp(startAt - Date.now(), 0, 1800);
      if(waitMs > 0){
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      const rolled = await animateRoll(sides, { seed });
      if(actor){
        const sub = $("diceSub");
        if(sub) sub.textContent = `${actor} 굴림: ${getDamageDiceLabel(sides)} -> ${rolled}`;
      }
      if(syncId && rollSyncPending.has(syncId)){
        const waiter = rollSyncPending.get(syncId);
        rollSyncPending.delete(syncId);
        if(waiter && typeof waiter.resolve === "function"){
          waiter.resolve(rolled);
        }
      }
    }).catch((_err) => {
      if(syncId && rollSyncPending.has(syncId)){
        const waiter = rollSyncPending.get(syncId);
        rollSyncPending.delete(syncId);
        if(waiter && typeof waiter.resolve === "function"){
          waiter.resolve(getDeterministicRollValueBySeed(sides, seed));
        }
      }
    });
  }

  function getPlasmaUseForAction(pc){
    if(!isPlasmaType(pc.type)) return 0;
    const maxCap = getEffectivePlasmaCap(pc, getStatStep(state.k));
    const activeSkill = getPcActivePlasmaSkill(pc);
    if(activeSkill){
      return clamp(getPlasmaSkillUseAmount(activeSkill), 1, maxCap);
    }
    return clamp(toInt(pc.multi || 1), 1, maxCap);
  }

  function getPlasmaUseReductionChance(pc, kState = state.k){
    const cfg = Object.assign(defaultK(), (kState && typeof kState === "object") ? kState : {});
    const intValue = clamp(toInt(pc && pc.int), 0, 99999);
    const step = clamp(toInt(cfg.intEffStep), 1, 999);
    const chancePct = clamp(toInt(cfg.intEffChancePct), 0, 100);
    const chance = Math.floor(intValue / step) * (chancePct / 100);
    return clamp(chance, 0, 0.95);
  }

  function requestUserPlasmaUse(useAmount, reserveCharge = false){
    return new Promise((resolve) => {
      if(!socket || !socket.connected){
        resolve({ ok: false, reason: "실시간 연결이 필요합니다." });
        return;
      }

      const roomId = getRoomId();
      const userSlot = getUserSlot();
      let done = false;
      const timer = setTimeout(() => {
        if(done) return;
        done = true;
        resolve({ ok: false, reason: "서버 응답 지연" });
      }, 1200);

      socket.emit("user_use_plasma", { roomId, userSlot, useAmount, reserveCharge: !!reserveCharge }, (resp) => {
        if(done) return;
        done = true;
        clearTimeout(timer);
        if(resp && resp.ok){
          resolve({
            ok: true,
            usedAmount: clamp(toInt(resp.usedAmount ?? useAmount), 0, 99999),
            reductionApplied: !!resp.reductionApplied
          });
          return;
        }
        resolve({ ok: false, reason: (resp && resp.reason) ? String(resp.reason) : "플라즈마 사용 실패" });
      });
    });
  }

  function requestUserConsumeSkipTurn(){
    return new Promise((resolve) => {
      if(!socket || !socket.connected){
        resolve({ ok: false, reason: "실시간 연결이 필요합니다." });
        return;
      }

      const roomId = getRoomId();
      const userSlot = getUserSlot();
      let done = false;
      const timer = setTimeout(() => {
        if(done) return;
        done = true;
        resolve({ ok: false, reason: "서버 응답 지연" });
      }, 1200);

      socket.emit("user_consume_skip_turn", { roomId, userSlot }, (resp) => {
        if(done) return;
        done = true;
        clearTimeout(timer);
        if(resp && resp.ok){
          resolve({ ok: true });
          return;
        }
        resolve({ ok: false, reason: (resp && resp.reason) ? String(resp.reason) : "턴 휴식 처리 실패" });
      });
    });
  }

  function requestUserApplyCombatDamage(amount, targetMonsterId){
    return new Promise((resolve) => {
      if(!socket || !socket.connected){
        resolve({ ok: false, reason: "실시간 연결이 필요합니다." });
        return;
      }

      const roomId = getRoomId();
      const userSlot = getUserSlot();
      const damage = clamp(toInt(amount), 0, 999999);
      const monsterId = safeText(targetMonsterId || "", 60);
      let done = false;
      const timer = setTimeout(() => {
        if(done) return;
        done = true;
        resolve({ ok: false, reason: "서버 응답 지연" });
      }, 1400);

      socket.emit("user_apply_combat_damage", { roomId, userSlot, amount: damage, targetMonsterId: monsterId }, (resp) => {
        if(done) return;
        done = true;
        clearTimeout(timer);
        if(resp && resp.ok){
          resolve({
            ok: true,
            monsterId: safeText(resp.monsterId || monsterId, 60),
            monsterName: safeText(resp.monsterName || "", 80),
            appliedDamage: clamp(toInt(resp.appliedDamage), 0, 999999),
            hpNow: clamp(toInt(resp.hpNow), 0, 999999),
            hpMax: clamp(toInt(resp.hpMax || 1), 1, 999999)
          });
          return;
        }
        resolve({ ok: false, reason: (resp && resp.reason) ? safeText(resp.reason, 80) : "피해 적용 실패" });
      });
    });
  }

  function applyDamageToPcSlotByAdmin(slot, amount){
    if(!isAdminRole()) return null;
    const targetSlot = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    const damage = clamp(toInt(amount), 0, 99999);
    if(damage <= 0) return null;
    const pc = ensurePc(targetSlot);
    const hpMax = clamp(toInt(pc.hp), 0, 99999);
    const before = clamp(toInt(pc.hpNow ?? hpMax), 0, hpMax);
    const after = clamp(before - damage, 0, hpMax);
    const applied = before - after;
    pc.hpNow = after;
    if(targetSlot === state.activePc){
      writePcToUI(pc);
    }
    return {
      slot: targetSlot,
      label: getPlayerSlotLabel(targetSlot),
      applied,
      hpNow: after,
      hpMax
    };
  }

  function applyDamageToFollowerNpcByAdmin(npcId, amount){
    if(!isAdminRole()) return null;
    const id = safeText(npcId || "", 60);
    if(!id) return null;
    const damage = clamp(toInt(amount), 0, 99999);
    if(damage <= 0) return null;
    const npc = findFollowerNpcById(id);
    if(!npc) return null;
    const hpMax = clamp(toInt(npc.hpMax || 1), 1, 99999);
    const before = clamp(toInt(npc.hpNow), 0, hpMax);
    const after = clamp(before - damage, 0, hpMax);
    const applied = before - after;
    npc.hpNow = after;
    return {
      followerId: id,
      label: safeText(npc.name || "동행 NPC", 80) || "동행 NPC",
      applied,
      hpNow: after,
      hpMax
    };
  }

  function applyDamageToActiveMonsterByAdmin(monsterId, amount){
    if(!isAdminRole()) return null;
    const id = safeText(monsterId || "", 60);
    if(!id) return null;
    const damage = clamp(toInt(amount), 0, 999999);
    if(damage <= 0) return null;

    const activeList = ensureActiveMonsters();
    const activeIndex = activeList.findIndex((monster) => safeText(monster && monster.id ? monster.id : "", 60) === id);
    if(activeIndex < 0) return null;
    const current = normalizeActiveMonster(activeList[activeIndex], activeIndex);
    const hpMax = clamp(toInt(current.hpMax || 1), 1, 999999);
    const before = clamp(toInt(current.hpNow), 0, hpMax);
    const after = clamp(before - damage, 0, hpMax);
    const applied = before - after;
    current.hpNow = after;
    activeList[activeIndex] = normalizeActiveMonster(current, activeIndex);

    const publishedList = ensurePublishedActiveMonsters();
    const publishedIndex = publishedList.findIndex((monster) => safeText(monster && monster.id ? monster.id : "", 60) === id);
    if(publishedIndex >= 0){
      const pubCurrent = normalizeActiveMonster(publishedList[publishedIndex], publishedIndex);
      pubCurrent.hpNow = clamp(after, 0, clamp(toInt(pubCurrent.hpMax || hpMax), 1, 999999));
      publishedList[publishedIndex] = normalizeActiveMonster(pubCurrent, publishedIndex);
    }

    const name = getMonsterDisplayNameById(id) || safeText(current.name || "몬스터", 80) || "몬스터";
    return {
      monsterId: id,
      name,
      applied,
      hpNow: after,
      hpMax
    };
  }

  async function consumePlasmaForRoll(){
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    if(!isPlasmaType(pc.type)) return { used: 0, reserveUsed: false };

    const requestedUse = getPlasmaUseForAction(pc);
    const reductionChance = getPlasmaUseReductionChance(pc);
    const reserveCharge = false;
    const baseUse = requestedUse;

    let reductionApplied = false;
    let useAmount = requestedUse;
    if(isAdminRole() && requestedUse > 0 && reductionChance > 0 && Math.random() < reductionChance){
      reductionApplied = true;
      useAmount = Math.max(0, requestedUse - 1);
    }

    if(toInt(pc.plasmaNow) < useAmount){
      alert("플라즈마가 부족합니다. 사용량을 줄이거나 회복하세요.");
      return null;
    }

    if(isAdminRole()){
      pc.plasmaNow = clamp(toInt(pc.plasmaNow) - useAmount, 0, toInt(pc.plasmaMax));
      writePcToUI(pc);
      render();
      saveLocal();
      return { used: useAmount, reserveUsed: reserveCharge, baseUse, reductionApplied };
    }

    if(!socket || !socket.connected){
      alert("플레이어 플라즈마 사용은 실시간 연결 후 가능합니다.");
      return null;
    }

    const result = await requestUserPlasmaUse(requestedUse, reserveCharge);
    if(!result.ok){
      alert(result.reason || "플라즈마 사용에 실패했습니다.");
      return null;
    }
    return {
      used: clamp(toInt(result.usedAmount ?? requestedUse), 0, 99999),
      reserveUsed: reserveCharge,
      baseUse,
      reductionApplied: !!result.reductionApplied
    };
  }

  async function roll(kind = "hit"){
    if(rolling) return;
    render({ skipSync: true });

    state.pcs[state.activePc] = readPcFromUI();
    const activePc = ensurePc(state.activePc);
    const selectedNpcBattle = getSelectedNpcBattleActor();
    const npcRollMode = isAdminRole() && !!selectedNpcBattle;
    const gmMonsterAttackSource = getAdminMonsterAttackSource();
    const gmMonsterRollMode = isAdminRole() && !!gmMonsterAttackSource;
    if(!gmMonsterRollMode && !npcRollMode){
      if(hasStatusEffect(activePc.statusEffects, "focus")){
        $("diceSub").textContent = "정신집중 상태입니다. GM이 해제하면 행동할 수 있습니다.";
        emitRollOutcome("정신집중 상태로 행동 대기");
        render({ skipSync: true });
        return;
      }
      if(toInt(activePc.skipTurns) > 0){
        if(isAdminRole()){
          activePc.skipTurns = clamp(toInt(activePc.skipTurns) - 1, 0, 99);
          writePcToUI(activePc);
          render();
          saveLocal();
        }else{
          if(!socket || !socket.connected){
            activePc.skipTurns = clamp(toInt(activePc.skipTurns) - 1, 0, 99);
            writePcToUI(activePc);
            render();
            saveLocal();
          }else{
            const skipResp = await requestUserConsumeSkipTurn();
            if(!skipResp.ok){
              alert(skipResp.reason || "턴 휴식 처리에 실패했습니다.");
              return;
            }
          }
        }
        syncActionLocks();
        saveLocal();
        queueUserActionSync(true);
        if(isAdminRole()) queueAdminSync(true);
        $("diceSub").textContent = "안정화 반동으로 이번 턴은 휴식합니다.";
        emitRollOutcome("안정화 반동으로 턴 휴식");
        return;
      }
    }

    const isHitRoll = kind === "hit";
    const plasmaResult = (isHitRoll && !gmMonsterRollMode && !npcRollMode)
      ? await consumePlasmaForRoll()
      : { used: 0, reserveUsed: false, baseUse: 0 };
    if(isHitRoll && !gmMonsterRollMode && !npcRollMode && plasmaResult === null) return;

    const pcHit = currentComputed.finalHit;
    const pcPow = currentComputed.finalPow;
    const npcHit = selectedNpcBattle ? clamp(toInt(selectedNpcBattle.hitBonus), -99, 99) : 0;
    const npcPow = selectedNpcBattle ? clamp(toInt(selectedNpcBattle.powBonus), -99, 99) : 0;
    const targetInfo = getTargetInfoForPc(state.activePc);
    const target = getTargetValue(targetInfo);
    const selectedMonsterAttack = (() => {
      const source = gmMonsterAttackSource;
      if(!source) return null;
      const targetPlayerSlot = normalizeMonsterTargetPlayerSlot(source.targetPlayerSlot);
      const targetFollowerId = normalizeMonsterTargetFollowerId(source.targetFollowerId ?? source.targetNpcId);
      const displayName = getMonsterDisplayNameById(source.id) || safeText(source.name || "운영몬스터", 40) || "운영몬스터";
      return {
        name: displayName,
        targetPlayerSlot,
        targetFollowerId,
        targetLabel: getMonsterTargetLabel({
          targetPlayerSlot,
          targetFollowerId
        }),
        damageDiceSides: normalizeDamageDiceSides(source.damageDiceSides, 6),
        hitBonus: clamp(toInt(source.attackHitBonus ?? source.hitBonus ?? 0), -99, 99),
        extraDamage: clamp(toInt(source.extraDamage || 0), -999, 999)
      };
    })();
    const isGmMonsterRollMode = gmMonsterRollMode && !!selectedMonsterAttack;
    const sides = isHitRoll
      ? 20
      : (isGmMonsterRollMode ? normalizeDamageDiceSides(selectedMonsterAttack.damageDiceSides, getDiceSides()) : getDiceSides());
    const hitBase = isGmMonsterRollMode ? 0 : (npcRollMode ? npcHit : pcHit);
    const powBase = isGmMonsterRollMode ? 0 : (npcRollMode ? npcPow : pcPow);
    const gmMonsterDefenseInfo = isGmMonsterRollMode
      ? getMonsterAttackDefenseInfo(selectedMonsterAttack)
      : null;
    const effectiveTarget = (isGmMonsterRollMode && gmMonsterDefenseInfo)
      ? gmMonsterDefenseInfo.dc
      : target;
    const effectiveTargetName = (isGmMonsterRollMode && gmMonsterDefenseInfo)
      ? gmMonsterDefenseInfo.label
      : targetInfo.name;
    if(isHitRoll){
      $("judgeBadge").textContent = "적중 굴림 중...";
      $("judgeBadge").className = "badge warn";
      $("sumBadge").textContent = "계산 중";
      setDiceTotalFx("...", "pending", { lockMs: 2000 });
    }else{
      $("judgeBadge").textContent = `피해 ${getDamageDiceLabel(sides)} 굴림 중...`;
      $("judgeBadge").className = "badge warn";
      $("sumBadge").textContent = "계산 중";
      setDiceTotalFx("...", "pending", { lockMs: 2000 });
    }

    const d = await requestSynchronizedRoll(isHitRoll ? "hit" : "damage", sides);

    const extras = [];
    let modeMessage = isHitRoll
      ? `적중굴림 : ${d}`
      : `피해굴림 : ${getDamageDiceLabel(sides)} -> ${d}`;
    if(plasmaResult && plasmaResult.used > 0){
      extras.push(`플라즈마 -${plasmaResult.used}`);
    }
    if(plasmaResult && plasmaResult.reductionApplied){
      extras.push("지능 효율 발동(-1)");
    }
    if(plasmaResult && plasmaResult.reserveUsed){
      extras.push("안정화 발동(정신집중 부여)");
    }
    if(isGmMonsterRollMode){
      extras.push("GM 몬스터 굴림 모드");
    }
    extras.push(`대상: ${effectiveTargetName}`);
    if(isGmMonsterRollMode && gmMonsterDefenseInfo){
      if(gmMonsterDefenseInfo.kind === "pc"){
        extras.push(`방어 DC ${gmMonsterDefenseInfo.dc} (기본 ${gmMonsterDefenseInfo.base} ${formatSignedNumber(gmMonsterDefenseInfo.bonus)})`);
      }else{
        extras.push(`NPC 방어 DC ${gmMonsterDefenseInfo.dc}`);
      }
    }else if(isGmMonsterRollMode){
      extras.push("몬스터 타겟 미설정(기본 목표 사용)");
    }
    let rollLogText = "";
    let finalDiceSubText = "";

    if(isHitRoll){
      const baseHitExpr = `${d} + ${hitBase}`;
      const hasMonsterAttackSource = isGmMonsterRollMode;
      const hasMonsterHitTerm = hasMonsterAttackSource && selectedMonsterAttack.hitBonus !== 0;
      const hitExpr = hasMonsterHitTerm
        ? `${baseHitExpr} ${selectedMonsterAttack.hitBonus >= 0 ? `+ ${selectedMonsterAttack.hitBonus}` : `- ${Math.abs(selectedMonsterAttack.hitBonus)}`}`
        : baseHitExpr;
      const sum = d + hitBase + (hasMonsterAttackSource ? selectedMonsterAttack.hitBonus : 0);
      const j = judge(sum, effectiveTarget);
      modeMessage = `적중굴림 : ${sum} : ${hitExpr}`;
      let successLabel = sum >= effectiveTarget ? "성공" : "실패";
      const showHitTargetDc = isGmMonsterRollMode ? true : isDcVisibleToCurrentRole(targetInfo);
      $("judgeBadge").textContent = showHitTargetDc ? `${j.label} (목표 ${effectiveTarget})` : j.label;
      $("judgeBadge").className = `badge ${j.cls}`;
      $("sumBadge").textContent = `${hitExpr} = ${sum}`;
      if(hasMonsterAttackSource){
        extras.push(`몬스터 공격: ${selectedMonsterAttack.name} -> ${selectedMonsterAttack.targetLabel}`);
      }
      if(hasMonsterHitTerm){
        extras.push(`몬스터 적중보정 ${formatSignedNumber(selectedMonsterAttack.hitBonus)}`);
      }

      if(d === 20){
        $("judgeBadge").textContent = "대성공 (자연 20)";
        $("judgeBadge").className = "badge good";
        extras.push("크리티컬");
        successLabel = "성공";
        setDiceTotalFx(String(sum), "critical", { lockMs: 3200 });
      }else if(d === 1){
        $("judgeBadge").textContent = "대실패 (자연 1)";
        $("judgeBadge").className = "badge bad";
        extras.push("펌블");
        successLabel = "실패";
        setDiceTotalFx(String(sum), "fumble", { lockMs: 2800 });
      }else if(sum >= effectiveTarget){
        setDiceTotalFx(String(sum), "success", { lockMs: 2400 });
      }else{
        setDiceTotalFx(String(sum), "fail", { lockMs: 2400 });
      }
      const compactTerms = [String(d)];
      if(hitBase !== 0){
        compactTerms.push(hitBase >= 0 ? `+${hitBase}` : `-${Math.abs(hitBase)}`);
      }
      if(hasMonsterHitTerm){
        compactTerms.push(
          selectedMonsterAttack.hitBonus >= 0
            ? `+${selectedMonsterAttack.hitBonus}`
            : `-${Math.abs(selectedMonsterAttack.hitBonus)}`
        );
      }
      const compactExpr = compactTerms.join("");
      const compactTargetLabel = (isGmMonsterRollMode && gmMonsterDefenseInfo)
        ? (
          gmMonsterDefenseInfo.kind === "pc"
            ? (safeText(state.pcs[gmMonsterDefenseInfo.slot] && state.pcs[gmMonsterDefenseInfo.slot].name, 24) || effectiveTargetName)
            : (safeText(gmMonsterDefenseInfo.label, 24) || effectiveTargetName)
        )
        : effectiveTargetName;
      finalDiceSubText = `적중값 : ${sum} : ${compactExpr} | 대상 : ${compactTargetLabel} | ${successLabel}`;
      rollLogText = `적중값 : ${sum} : ${compactExpr} | 대상 : ${compactTargetLabel} | ${successLabel}`;
    }else{
      const hasMonsterDamageSource = isGmMonsterRollMode;
      const hasMonsterDamageTerm = hasMonsterDamageSource && selectedMonsterAttack.extraDamage !== 0;
      const monsterBonusExpr = selectedMonsterAttack && selectedMonsterAttack.extraDamage >= 0
        ? `+ ${selectedMonsterAttack.extraDamage}`
        : `- ${Math.abs(selectedMonsterAttack ? selectedMonsterAttack.extraDamage : 0)}`;
      const damageExpr = hasMonsterDamageTerm
        ? `${d} ${powBase >= 0 ? `+ ${powBase}` : `- ${Math.abs(powBase)}`} ${monsterBonusExpr}`
        : `${d} ${powBase >= 0 ? `+ ${powBase}` : `- ${Math.abs(powBase)}`}`;
      const damageSum = d + powBase + (hasMonsterDamageSource ? selectedMonsterAttack.extraDamage : 0);
      const appliedDamage = clamp(toInt(damageSum), 0, 999999);
      const powExpr = powBase >= 0 ? `+ ${powBase}` : `- ${Math.abs(powBase)}`;
      const damageDiceLabel = getDamageDiceLabel(sides);
      let autoApplyLog = "";
      let shouldRenderAfterApply = false;
      if(hasMonsterDamageSource){
        extras.push(`몬스터 공격: ${selectedMonsterAttack.name} -> ${selectedMonsterAttack.targetLabel}`);
      }
      if(hasMonsterDamageTerm){
        extras.push(`몬스터 추가데미지 ${formatSignedNumber(selectedMonsterAttack.extraDamage)}`);
      }
      if(appliedDamage <= 0){
        extras.push("자동적용 생략(피해 0)");
        autoApplyLog = "자동적용 생략(피해 0)";
      }else if(hasMonsterDamageSource){
        const attackTarget = resolveMonsterAttackTarget(selectedMonsterAttack);
        if(attackTarget.kind === "none"){
          extras.push("자동적용 실패: 몬스터 타깃 미설정");
          autoApplyLog = "자동적용 실패(몬스터 타깃 미설정)";
        }else if(isAdminRole()){
          if(attackTarget.kind === "pc"){
            const appliedToPc = applyDamageToPcSlotByAdmin(attackTarget.slot, appliedDamage);
            if(appliedToPc && appliedToPc.applied > 0){
              extras.push(`자동적용: ${appliedToPc.label} HP ${appliedToPc.hpNow}/${appliedToPc.hpMax}`);
              autoApplyLog = `${appliedToPc.label} -${appliedToPc.applied} (HP ${appliedToPc.hpNow}/${appliedToPc.hpMax})`;
              shouldRenderAfterApply = true;
            }else{
              const label = appliedToPc ? appliedToPc.label : getPlayerSlotLabel(attackTarget.slot);
              extras.push(`자동적용: ${label} HP 변동 없음`);
              autoApplyLog = `${label} 변동 없음`;
            }
          }else if(attackTarget.kind === "npc"){
            const appliedToNpc = applyDamageToFollowerNpcByAdmin(attackTarget.followerId, appliedDamage);
            if(appliedToNpc && appliedToNpc.applied > 0){
              extras.push(`자동적용: ${appliedToNpc.label} HP ${appliedToNpc.hpNow}/${appliedToNpc.hpMax}`);
              autoApplyLog = `${appliedToNpc.label} -${appliedToNpc.applied} (HP ${appliedToNpc.hpNow}/${appliedToNpc.hpMax})`;
              shouldRenderAfterApply = true;
            }else{
              const fallbackLabel = safeText(attackTarget.label, 80) || "NPC";
              const label = appliedToNpc ? appliedToNpc.label : fallbackLabel;
              extras.push(`자동적용: ${label} HP 변동 없음`);
              autoApplyLog = `${label} 변동 없음`;
            }
          }
        }else{
          extras.push("자동적용 실패: 관리자 전용 몬스터 공격");
          autoApplyLog = "자동적용 실패(관리자 전용)";
        }
      }else{
        const targetMonsterId = getEncounterMonsterIdForPc(state.activePc, { usePublished: !isAdminRole() });
        if(!targetMonsterId){
          extras.push("자동적용 실패: 대상 몬스터 없음");
          autoApplyLog = "자동적용 실패(대상 몬스터 없음)";
        }else if(isAdminRole()){
          const appliedToMonster = applyDamageToActiveMonsterByAdmin(targetMonsterId, appliedDamage);
          if(appliedToMonster && appliedToMonster.applied > 0){
            extras.push(`자동적용: ${appliedToMonster.name} HP ${appliedToMonster.hpNow}/${appliedToMonster.hpMax}`);
            autoApplyLog = `${appliedToMonster.name} -${appliedToMonster.applied} (HP ${appliedToMonster.hpNow}/${appliedToMonster.hpMax})`;
            shouldRenderAfterApply = true;
          }else if(appliedToMonster){
            extras.push(`자동적용: ${appliedToMonster.name} HP 변동 없음`);
            autoApplyLog = `${appliedToMonster.name} 변동 없음`;
          }else{
            extras.push("자동적용 실패: 운영중 몬스터가 아님");
            autoApplyLog = "자동적용 실패(운영중 몬스터 아님)";
          }
        }else{
          const applyResp = await requestUserApplyCombatDamage(appliedDamage, targetMonsterId);
          if(applyResp && applyResp.ok){
            const appliedName = safeText(
              applyResp.monsterName || getMonsterDisplayNameById(applyResp.monsterId, { usePublished: true }) || "몬스터",
              80
            ) || "몬스터";
            const appliedValue = clamp(toInt(applyResp.appliedDamage ?? appliedDamage), 0, 999999);
            extras.push(`자동적용: ${appliedName} HP ${applyResp.hpNow}/${applyResp.hpMax}`);
            autoApplyLog = `${appliedName} -${appliedValue} (HP ${applyResp.hpNow}/${applyResp.hpMax})`;
          }else{
            const reason = safeText(applyResp && applyResp.reason ? applyResp.reason : "동기화 실패", 80) || "동기화 실패";
            extras.push(`자동적용 실패: ${reason}`);
            autoApplyLog = `자동적용 실패(${reason})`;
          }
        }
      }
      if(shouldRenderAfterApply){
        render({ skipSync: true });
      }
      $("judgeBadge").textContent = `피해 ${damageDiceLabel}`;
      $("judgeBadge").className = "badge warn";
      $("sumBadge").textContent = `${damageExpr} = ${damageSum}`;
      setDiceTotalFx(String(damageSum), "damage", { lockMs: 2000 });
      modeMessage = `피해굴림 : ${damageSum} : ${damageExpr}`;
      rollLogText = hasMonsterDamageSource
        ? `피해굴림 | 합산값 ${damageSum} (${damageExpr}, ${damageDiceLabel}) | 몬스터 ${selectedMonsterAttack.name} -> ${selectedMonsterAttack.targetLabel}`
        : `피해굴림 | 합산값 ${damageSum} (${d} ${powExpr}, ${damageDiceLabel})`;
      if(autoApplyLog){
        rollLogText = `${rollLogText} | ${autoApplyLog}`;
      }
    }
    if(!finalDiceSubText){
      finalDiceSubText = extras.length > 0 ? `${modeMessage} | ${extras.join(" | ")}` : modeMessage;
    }
    $("diceSub").textContent = finalDiceSubText;
    emitRollOutcome(rollLogText);
    if(isHitRoll){
      holdHitDiceDisplay(3000);
    }else{
      clearHitDiceDisplayHold();
    }
    syncActionLocks();
    saveLocal();
    queueUserActionSync(true);
    if(isAdminRole()) queueAdminSync(true);
  }

  function makeAvatarPlaceholder(label){
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1f2937" />
            <stop offset="100%" stop-color="#111827" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="48" fill="url(#g)" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#d1d5db" font-size="28" font-family="Arial">${label}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function makeMonsterPlaceholder(label = "M"){
    const safeLabel = safeText(label, 2).toUpperCase() || "M";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6b3f24" />
            <stop offset="100%" stop-color="#3f2414" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="16" fill="url(#mg)" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#f5e3c1" font-size="30" font-family="Arial">${safeLabel}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function makeFollowerPlaceholder(label = "N"){
    const safeLabel = safeText(label, 2).toUpperCase() || "N";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6a4a2b" />
            <stop offset="100%" stop-color="#4a2f19" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="48" fill="url(#fg)" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#f3e2bf" font-size="30" font-family="Arial">${safeLabel}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function getMonsterImageSrc(monster){
    const image = sanitizeMonsterImageDataUrl(monster && monster.image ? monster.image : "");
    if(image) return image;
    const name = safeText(monster && monster.name ? monster.name : "", 2);
    const initial = name ? name.slice(0, 1) : "M";
    return makeMonsterPlaceholder(initial);
  }

  function getFollowerImageSrc(npc){
    const image = sanitizeFollowerImageDataUrl(npc && npc.image ? npc.image : "");
    if(image) return image;
    const name = safeText(npc && npc.name ? npc.name : "", 2);
    const initial = name ? name.slice(0, 1) : "N";
    return makeFollowerPlaceholder(initial);
  }

  const avatarFallbacks = Array.from({ length: MAX_PLAYERS }, (_, i) => makeAvatarPlaceholder(`U${i + 1}`));

  function getSelectedNpcBattleActor(){
    const id = safeText(selectedNpcBattleId || "", 60);
    if(!id) return null;
    if(!isAdminRole()) return null;
    const npc = ensurePartyFollowers().find((entry) => safeText(entry.id || "", 60) === id) || null;
    if(!npc){
      selectedNpcBattleId = "";
      return null;
    }
    return npc;
  }

  function renderPcTabs(){
    const tabs = $("pcTabs");
    if(!tabs) return;
    const selectedNpc = getSelectedNpcBattleActor();
    tabs.innerHTML = "";
    for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
      const tab = document.createElement("div");
      tab.className = "tab";
      tab.dataset.pc = String(slot);
      tab.textContent = `PC${slot + 1}`;
      if(!selectedNpc && slot === state.activePc){
        tab.classList.add("active");
      }
      tabs.appendChild(tab);
    }
    if(!isAdminRole()) return;
    const followers = ensurePartyFollowers();
    for(const npc of followers){
      const npcId = safeText(npc.id || "", 60);
      if(!npcId) continue;
      const tab = document.createElement("div");
      tab.className = "tab npcTab";
      tab.dataset.npcId = npcId;
      const npcName = safeText(npc.name || "NPC", 20) || "NPC";
      tab.textContent = `NPC ${npcName}`;
      if(selectedNpc && safeText(selectedNpc.id || "", 60) === npcId){
        tab.classList.add("active");
      }
      tabs.appendChild(tab);
    }
  }

  function updateActiveIndicators(){
    const selectedNpc = getSelectedNpcBattleActor();
    const selectedNpcId = safeText(selectedNpc && selectedNpc.id ? selectedNpc.id : "", 60);
    document.querySelectorAll(".tab").forEach((t) => {
      const tabNpcId = safeText(t.dataset.npcId || "", 60);
      if(tabNpcId){
        t.classList.toggle("active", !!selectedNpcId && tabNpcId === selectedNpcId);
        return;
      }
      t.classList.toggle("active", !selectedNpcId && toInt(t.dataset.pc) === state.activePc);
    });
    document.querySelectorAll(".playerCard").forEach((card) => {
      card.classList.toggle("active", toInt(card.dataset.slot) === state.activePc);
    });
  }

  function applyInjuryStep(currentLevelRaw, delta = 1){
    const current = clamp(toInt(currentLevelRaw), 0, 4);
    const step = toInt(delta);
    if(step < 0){
      // Right-click should behave as undo, not wrap-around.
      return clamp(current + step, 0, 4);
    }
    const forward = step === 0 ? 1 : step;
    return ((current + forward) % 5 + 5) % 5;
  }

  function setInjuryLevelByAdmin(slot, partKey, delta = 1){
    if(!isAdminRole()) return;
    const key = safeText(partKey || "", 40);
    const partKeys = InjuryBodyMap && Array.isArray(InjuryBodyMap.PART_KEYS) ? InjuryBodyMap.PART_KEYS : [];
    if(!partKeys.includes(key)) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    const injuryMap = sanitizeInjuryMap(pc.injuryMap || {});
    injuryMap[key] = applyInjuryStep(injuryMap[key], delta);
    pc.injuryMap = injuryMap;
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function resetInjuryByAdmin(slot){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.injuryMap = createEmptyInjuryMap();
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function renderInjuryBoardForSlot(slot, pcRaw){
    const wrap = $(`injuryBoard${slot}`);
    if(!wrap) return;
    if(!InjuryBodyMap || typeof InjuryBodyMap.renderBoard !== "function"){
      wrap.innerHTML = "";
      return;
    }
    const pc = pcRaw && typeof pcRaw === "object" ? pcRaw : ensurePc(slot);
    const injuryMap = sanitizeInjuryMap(pc.injuryMap || {});
    pc.injuryMap = injuryMap;
    const admin = isAdminRole();
    InjuryBodyMap.renderBoard(wrap, injuryMap, {
      readOnly: !admin,
      onToggle: (partKey) => setInjuryLevelByAdmin(slot, partKey),
      onToggleDetail: (partKey, delta) => setInjuryLevelByAdmin(slot, partKey, delta),
      onReset: admin ? () => resetInjuryByAdmin(slot) : null
    });
  }

  function setActiveMonsterInjuryLevelByAdmin(monsterId, partKey, delta = 1){
    if(!isAdminRole()) return;
    const key = safeText(partKey || "", 40);
    const partKeys = InjuryBodyMap && Array.isArray(InjuryBodyMap.PART_KEYS) ? InjuryBodyMap.PART_KEYS : [];
    if(!partKeys.includes(key)) return;
    mutateActiveMonster(monsterId, (draft) => {
      const map = sanitizeInjuryMap(draft.injuryMap || draft.injuries || draft.bodyInjury || {});
      map[key] = applyInjuryStep(map[key], delta);
      draft.injuryMap = map;
    });
  }

  function resetActiveMonsterInjuryByAdmin(monsterId){
    if(!isAdminRole()) return;
    mutateActiveMonster(monsterId, (draft) => {
      draft.injuryMap = createEmptyInjuryMap();
    });
  }

  function renderMonsterInjuryBoard(monsterId, monsterRaw, readOnly = true){
    const wrap = document.createElement("div");
    wrap.className = "injuryBoardWrap monsterInjuryBoard";
    if(!InjuryBodyMap || typeof InjuryBodyMap.renderBoard !== "function"){
      return wrap;
    }
    const map = sanitizeInjuryMap(monsterRaw && monsterRaw.injuryMap ? monsterRaw.injuryMap : {});
    InjuryBodyMap.renderBoard(wrap, map, {
      readOnly: !!readOnly,
      onToggle: readOnly ? null : (partKey) => setActiveMonsterInjuryLevelByAdmin(monsterId, partKey),
      onToggleDetail: readOnly ? null : (partKey, delta) => setActiveMonsterInjuryLevelByAdmin(monsterId, partKey, delta),
      onReset: readOnly ? null : () => resetActiveMonsterInjuryByAdmin(monsterId)
    });
    return wrap;
  }

  function renderPlayerCards(){
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      const pc = state.pcs[i] || defaultPC(i);
      const cardEl = $(`playerCard${i}`);
      const nameEl = $(`playerName${i}`);
      const hpEl = $(`playerHp${i}`);
      const hpBarEl = $(`playerHpBar${i}`);
      const plasmaWrap = $(`playerPlasma${i}`);
      const hungerWrap = $(`playerHunger${i}`);
      const statusWrap = $(`playerStatus${i}`);
      const avatarEl = $(`avatar${i}`);
      const alwaysEl = $(`alwaysHit${i}`);
      const alwaysPowEl = $(`alwaysPow${i}`);
      const distanceQuickEl = $(`distanceQuick${i}`);
      const attackRangeQuickEl = $(`attackRangeQuick${i}`);
      const hpMax = clamp(toInt(pc.hp), 0, 99999);
      const hpNow = clamp(toInt(pc.hpNow ?? hpMax), 0, hpMax);
      const defenseDc = getPlayerDefenseDc(pc, state.k);
      const hpGaugeBase = Math.max(1, hpMax);
      const hpPercent = clamp(Math.round((hpNow / hpGaugeBase) * 100), 0, 100);

      nameEl.textContent = pc.name || `User${i + 1}`;
      hpEl.textContent = `HP ${hpNow}/${hpMax} | 포인트 ${clamp(toInt(pc.skillPoints), 0, 99999)} | DC ${defenseDc.total}`;
      hpEl.title = `기본 DC ${defenseDc.base} + 보정 ${defenseDc.bonus >= 0 ? `+${defenseDc.bonus}` : defenseDc.bonus}`;

      if(hpBarEl){
        hpBarEl.style.width = `${hpPercent}%`;
        hpBarEl.title = `HP ${hpNow} / ${hpGaugeBase}`;
      }
      if(cardEl){
        const hpStateClass = hpPercent <= 30
          ? "hp-state-low"
          : (hpPercent <= 70 ? "hp-state-mid" : "hp-state-high");
        const criticalIntensity = hpPercent <= 30
          ? clamp((30 - hpPercent) / 30, 0, 1)
          : 0;
        cardEl.classList.remove("hp-state-high", "hp-state-mid", "hp-state-low");
        cardEl.classList.add(hpStateClass);
        cardEl.style.setProperty("--hp-critical-intensity", criticalIntensity.toFixed(3));
      }

      if(plasmaWrap){
        const plasmaNow = clamp(toInt(pc.plasmaNow), 0, 99999);
        const plasmaMax = clamp(toInt(pc.plasmaMax || pc.pool || 1), 1, 99999);
        const visible = Math.min(plasmaMax, 10);
        const admin = isAdminRole();
        plasmaWrap.innerHTML = "";
        for(let orbIdx = 0; orbIdx < visible; orbIdx += 1){
          const orb = document.createElement("span");
          orb.className = `playerPlasmaOrb ${orbIdx < plasmaNow ? "on" : ""}`;
          orb.title = `${plasmaNow} / ${plasmaMax}`;
          if(admin){
            const target = orbIdx + 1;
            orb.classList.add("clickable");
            orb.setAttribute("role", "button");
            orb.tabIndex = 0;
            orb.setAttribute("aria-label", `플라즈마 ${target}/${plasmaMax} 설정`);
            const onToggle = (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              const nextPlasma = plasmaNow === target ? (target - 1) : target;
              setPlasmaByAdmin(i, nextPlasma);
            };
            orb.addEventListener("click", onToggle);
            orb.addEventListener("keydown", (ev) => {
              if(ev.key !== "Enter" && ev.key !== " ") return;
              onToggle(ev);
            });
          }
          plasmaWrap.appendChild(orb);
        }
        if(plasmaMax > visible){
          const more = document.createElement("span");
          more.className = "playerPlasmaMore";
          more.textContent = `+${plasmaMax - visible}`;
          if(admin){
            more.classList.add("clickable");
            more.setAttribute("role", "button");
            more.tabIndex = 0;
            more.setAttribute("aria-label", `플라즈마 최대치 ${plasmaMax} 토글`);
            const onToggleMore = (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              const nextPlasma = plasmaNow >= plasmaMax ? visible : plasmaMax;
              setPlasmaByAdmin(i, nextPlasma);
            };
            more.addEventListener("click", onToggleMore);
            more.addEventListener("keydown", (ev) => {
              if(ev.key !== "Enter" && ev.key !== " ") return;
              onToggleMore(ev);
            });
          }
          plasmaWrap.appendChild(more);
        }
      }

      if(hungerWrap){
        const hunger = clamp(toInt(pc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
        hungerWrap.innerHTML = "";
        hungerWrap.classList.toggle("is-low", hunger <= 2);
        hungerWrap.title = `배고픔 ${hunger}/${HUNGER_MAX}`;

        for(let hungerStep = 1; hungerStep <= HUNGER_MAX; hungerStep += 1){
          const pip = document.createElement("button");
          pip.type = "button";
          pip.className = `hungerPip ${hungerStep <= hunger ? "on" : "off"}`;
          pip.textContent = "🍗";
          pip.setAttribute("aria-label", `배고픔 ${hungerStep}/${HUNGER_MAX} 설정`);
          pip.title = `배고픔 ${hungerStep}/${HUNGER_MAX}`;
          if(isAdminRole()){
            pip.addEventListener("click", (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              const nextHunger = (hunger === hungerStep) ? (hungerStep - 1) : hungerStep;
              setHungerByAdmin(i, nextHunger);
            });
          }else{
            pip.disabled = true;
            pip.tabIndex = -1;
          }
          hungerWrap.appendChild(pip);
        }
      }

      if(statusWrap){
        const statusList = sanitizeStatusEffects(pc.statusEffects);
        renderStatusBadgesInto(statusWrap, statusList, STATUS_EFFECTS.length, { hideOverflowChip: true });
        renderPlayerCardStatusEditor(i, statusWrap);
      }

      const avatarSrc = sanitizeAvatarDataUrl(pc.avatar || "");
      if(!avatarEl.dataset.fallbackBound){
        avatarEl.onerror = () => { avatarEl.src = avatarFallbacks[i]; };
        avatarEl.dataset.fallbackBound = "1";
      }
      avatarEl.src = avatarSrc || avatarFallbacks[i];
      avatarEl.alt = `${nameEl.textContent} 이미지`;
      if(alwaysEl){
        const hit = clamp(toInt(pc.alwaysHit), -99, 99);
        alwaysEl.textContent = hit >= 0 ? `+${hit}` : `${hit}`;
      }
      if(alwaysPowEl){
        const pow = clamp(toInt(pc.alwaysPow), -99, 99);
        alwaysPowEl.textContent = pow >= 0 ? `+${pow}` : `${pow}`;
      }
      if(distanceQuickEl){
        const distanceValue = DISTANCE_KEYS.includes(String(pc.distance || "")) ? String(pc.distance) : "close";
        distanceQuickEl.value = distanceValue;
        distanceQuickEl.disabled = !isAdminRole();
      }
      if(attackRangeQuickEl){
        const attackRangeValue = String(pc.plasmaRangeKind || "") === "far" ? "far" : "close";
        attackRangeQuickEl.value = attackRangeValue;
        attackRangeQuickEl.disabled = !isAdminRole();
      }
      renderInjuryBoardForSlot(i, pc);
    }
    renderFollowerCardsInPlayerStrip();
  }

  function renderFollowerCardsInPlayerStrip(){
    const strip = $("playerStrip") || document.querySelector(".playerStrip");
    if(!strip) return;
    strip.querySelectorAll(".followerCard").forEach((el) => el.remove());
    const followers = ensurePartyFollowers();
    if(followers.length <= 0) return;

    const anchor = $(`playerCard${MAX_PLAYERS - 1}`) || strip.lastElementChild;
    if(!anchor) return;
    const admin = isAdminRole();
    const quickDamageSelect = $("pcQuickDamageTarget");
    const selectedQuickTarget = quickDamageSelect ? String(quickDamageSelect.value || "pc_active") : "pc_active";

    let insertAfter = anchor;
    for(const npc of followers){
      const npcId = safeText(npc.id || "", 60);
      const card = document.createElement("div");
      card.className = "followerCard";
      if(selectedQuickTarget === `npc:${npcId}`){
        card.classList.add("selected");
      }
      if(admin && quickDamageSelect){
        card.classList.add("clickable");
        card.title = "이 NPC를 빠른 피해 대상로 선택";
        card.addEventListener("click", () => {
          syncQuickDamageTargetOptions();
          quickDamageSelect.value = `npc:${npcId}`;
          render({ skipSync: true });
        });
      }

      const avatar = document.createElement("img");
      avatar.className = "avatar followerAvatar";
      avatar.alt = `${npc.name} 이미지`;
      avatar.src = getFollowerImageSrc(npc);
      avatar.loading = "lazy";
      avatar.decoding = "async";

      const main = document.createElement("div");
      main.className = "playerMeta followerMain";

      const name = document.createElement("div");
      name.className = "name followerName";
      name.textContent = npc.name;

      const hp = document.createElement("div");
      hp.className = "hp followerHp";
      hp.textContent = `HP ${npc.hpNow}/${npc.hpMax}`;

      const hpBar = document.createElement("div");
      hpBar.className = "playerHpBar followerHpBar";
      const hpBarFill = document.createElement("span");
      hpBarFill.className = "playerHpBarFill";
      const hpMax = Math.max(1, toInt(npc.hpMax));
      const hpNow = clamp(toInt(npc.hpNow), 0, hpMax);
      const hpPercent = clamp(Math.round((hpNow / hpMax) * 100), 0, 100);
      const hpStateClass = hpPercent <= 30
        ? "hp-state-low"
        : (hpPercent <= 70 ? "hp-state-mid" : "hp-state-high");
      const criticalIntensity = hpPercent <= 30
        ? clamp((30 - hpPercent) / 30, 0, 1)
        : 0;
      card.classList.add(hpStateClass);
      card.style.setProperty("--hp-critical-intensity", criticalIntensity.toFixed(3));
      hpBarFill.style.width = `${(hpNow / hpMax) * 100}%`;
      hpBar.appendChild(hpBarFill);

      const plasmaWrap = document.createElement("div");
      plasmaWrap.className = "playerPlasmaMini followerPlasmaMini";
      const plasmaNow = clamp(toInt(npc.plasmaNow), 0, 99999);
      const plasmaMax = clamp(toInt(npc.plasmaMax), 1, 99999);
      const visiblePlasma = Math.min(plasmaMax, 10);
      for(let orbIdx = 0; orbIdx < visiblePlasma; orbIdx += 1){
        const orb = document.createElement("span");
        orb.className = `playerPlasmaOrb ${orbIdx < plasmaNow ? "on" : ""}`;
        orb.title = `${plasmaNow} / ${plasmaMax}`;
        if(admin){
          const target = orbIdx + 1;
          orb.classList.add("clickable");
          orb.setAttribute("role", "button");
          orb.tabIndex = 0;
          orb.setAttribute("aria-label", `${npc.name} 플라즈마 ${target}/${plasmaMax} 설정`);
          const onToggle = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const nextPlasma = plasmaNow === target ? (target - 1) : target;
            setFollowerNpcPlasmaByAdmin(npcId, nextPlasma);
          };
          orb.addEventListener("click", onToggle);
          orb.addEventListener("keydown", (ev) => {
            if(ev.key !== "Enter" && ev.key !== " ") return;
            onToggle(ev);
          });
        }
        plasmaWrap.appendChild(orb);
      }
      if(plasmaMax > visiblePlasma){
        const more = document.createElement("span");
        more.className = "playerPlasmaMore";
        more.textContent = `+${plasmaMax - visiblePlasma}`;
        if(admin){
          more.classList.add("clickable");
          more.setAttribute("role", "button");
          more.tabIndex = 0;
          more.setAttribute("aria-label", `${npc.name} 플라즈마 최대치 설정`);
          const onToggleMore = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const nextPlasma = plasmaNow >= plasmaMax ? visiblePlasma : plasmaMax;
            setFollowerNpcPlasmaByAdmin(npcId, nextPlasma);
          };
          more.addEventListener("click", onToggleMore);
          more.addEventListener("keydown", (ev) => {
            if(ev.key !== "Enter" && ev.key !== " ") return;
            onToggleMore(ev);
          });
        }
        plasmaWrap.appendChild(more);
      }

      const hungerWrap = document.createElement("div");
      hungerWrap.className = "playerHungerMini followerHungerMini";
      const hunger = clamp(toInt(npc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
      hungerWrap.classList.toggle("is-low", hunger <= 2);
      hungerWrap.title = `배고픔 ${hunger}/${HUNGER_MAX}`;
      for(let hungerStep = 1; hungerStep <= HUNGER_MAX; hungerStep += 1){
        const pip = document.createElement("button");
        pip.type = "button";
        pip.className = `hungerPip ${hungerStep <= hunger ? "on" : "off"}`;
        pip.textContent = "🍗";
        pip.setAttribute("aria-label", `${npc.name} 배고픔 ${hungerStep}/${HUNGER_MAX} 설정`);
        pip.title = `${npc.name} 배고픔 ${hungerStep}/${HUNGER_MAX}`;
        if(admin){
          pip.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const nextHunger = (hunger === hungerStep) ? (hungerStep - 1) : hungerStep;
            setFollowerNpcHungerByAdmin(npcId, nextHunger);
          });
        }else{
          pip.disabled = true;
          pip.tabIndex = -1;
        }
        hungerWrap.appendChild(pip);
      }

      const statusWrap = document.createElement("div");
      statusWrap.className = "playerStatusMini followerStatusMini";
      renderStatusBadgesInto(statusWrap, npc.statusEffects, 5, { hideOverflowChip: true });

      const owner = document.createElement("div");
      owner.className = "followerOwner";
      owner.textContent = "공용 NPC 슬롯";

      let combatInfo = null;
      let combatInputs = null;
      if(admin){
        let previewDc = clamp(toInt(npc.dc ?? PLAYER_BASE_DC), 1, 99999);
        let previewHitBonus = clamp(toInt(npc.hitBonus), -99, 99);
        let previewPowBonus = clamp(toInt(npc.powBonus), -99, 99);
        const refreshCombatInfoText = () => {
          if(!combatInfo) return;
          combatInfo.textContent = `DC ${previewDc} | 추가 적중 ${formatSignedNumber(previewHitBonus)} | 추가 데미지 ${formatSignedNumber(previewPowBonus)}`;
        };

        combatInfo = document.createElement("div");
        combatInfo.className = "followerCombatInfo";
        refreshCombatInfoText();

        const makeCombatField = (labelText, value, min, max, onPreview, onCommit) => {
          const field = document.createElement("label");
          field.className = "followerCombatField";

          const label = document.createElement("span");
          label.textContent = labelText;
          field.appendChild(label);

          const input = document.createElement("input");
          input.type = "number";
          input.min = String(min);
          input.max = String(max);
          input.step = "1";
          let lastStableValue = clamp(toInt(value), min, max);
          input.value = String(lastStableValue);
          const stopPropagation = (ev) => ev.stopPropagation();
          input.addEventListener("click", stopPropagation);
          input.addEventListener("mousedown", stopPropagation);
          const parseInputValue = () => {
            const raw = String(input.value || "").trim();
            if(!raw || raw === "-" || raw === "+") return null;
            const numeric = Number(raw);
            if(!Number.isFinite(numeric)) return null;
            return clamp(Math.trunc(numeric), min, max);
          };
          const commitValue = () => {
            const parsed = parseInputValue();
            if(parsed === null){
              input.value = String(lastStableValue);
              return;
            }
            lastStableValue = parsed;
            input.value = String(parsed);
            onCommit(parsed);
          };
          input.addEventListener("keydown", (ev) => {
            stopPropagation(ev);
            if(ev.key === "Enter"){
              ev.preventDefault();
              commitValue();
            }
          });
          input.addEventListener("input", () => {
            const parsed = parseInputValue();
            if(parsed === null) return;
            lastStableValue = parsed;
            onPreview(parsed);
          });
          input.addEventListener("blur", commitValue);
          input.addEventListener("change", commitValue);
          field.addEventListener("click", stopPropagation);
          field.addEventListener("mousedown", stopPropagation);
          field.appendChild(input);
          return field;
        };

        const previewFollowerBonus = (nextValue, key) => {
          const target = ensurePartyFollowers().find((it) => it.id === safeText(npcId, 60));
          if(target){
            if(key === "dc") target.dc = nextValue;
            if(key === "hit") target.hitBonus = nextValue;
            if(key === "pow") target.powBonus = nextValue;
          }
          if(key === "dc") previewDc = nextValue;
          if(key === "hit") previewHitBonus = nextValue;
          if(key === "pow") previewPowBonus = nextValue;
          refreshCombatInfoText();
        };

        combatInputs = document.createElement("div");
        combatInputs.className = "followerCombatInputs";
        combatInputs.appendChild(makeCombatField(
          "DC",
          npc.dc ?? PLAYER_BASE_DC,
          1,
          99999,
          (next) => previewFollowerBonus(next, "dc"),
          (next) => {
            previewFollowerBonus(next, "dc");
            setFollowerNpcCombatBonusByAdmin(npcId, { dc: next });
          }
        ));
        combatInputs.appendChild(makeCombatField(
          "적중",
          npc.hitBonus,
          -99,
          99,
          (next) => previewFollowerBonus(next, "hit"),
          (next) => {
            previewFollowerBonus(next, "hit");
            setFollowerNpcCombatBonusByAdmin(npcId, { hitBonus: next });
          }
        ));
        combatInputs.appendChild(makeCombatField(
          "데미지",
          npc.powBonus,
          -99,
          99,
          (next) => previewFollowerBonus(next, "pow"),
          (next) => {
            previewFollowerBonus(next, "pow");
            setFollowerNpcCombatBonusByAdmin(npcId, { powBonus: next });
          }
        ));
      }

      const extra = document.createElement("div");
      extra.className = "followerExtra alwaysModBox";
      extra.appendChild(owner);
      if(npc.note){
        const note = document.createElement("div");
        note.className = "followerNote";
        note.textContent = safeText(npc.note, 120);
        extra.appendChild(note);
      }
      if(combatInfo) extra.appendChild(combatInfo);
      if(combatInputs) extra.appendChild(combatInputs);

      main.appendChild(name);
      main.appendChild(hp);
      main.appendChild(hpBar);
      main.appendChild(plasmaWrap);
      main.appendChild(hungerWrap);
      main.appendChild(statusWrap);
      main.appendChild(extra);

      const rightCol = document.createElement("div");
      rightCol.className = "playerRightCol followerRightCol";
      const injuryWrap = document.createElement("div");
      injuryWrap.className = "injuryBoardWrap followerInjuryBoard";
      if(InjuryBodyMap && typeof InjuryBodyMap.renderBoard === "function"){
        InjuryBodyMap.renderBoard(injuryWrap, npc.injuryMap || {}, {
          readOnly: !admin,
          onToggle: admin ? (key) => toggleFollowerNpcInjuryByAdmin(npcId, key, 1) : null,
          onToggleDetail: admin ? (key, delta) => toggleFollowerNpcInjuryByAdmin(npcId, key, delta) : null,
          onReset: admin ? () => clearFollowerNpcInjuryByAdmin(npcId) : null
        });
      }
      rightCol.appendChild(injuryWrap);
      if(admin){
        const help = document.createElement("div");
        help.className = "small muted";
        help.textContent = "PL/허기 클릭으로 즉시 설정 가능";
        rightCol.appendChild(help);
      }

      card.appendChild(avatar);
      card.appendChild(main);
      card.appendChild(rightCol);

      insertAfter.insertAdjacentElement("afterend", card);
      insertAfter = card;
    }
  }

  function getPlayerSlotLabel(index){
    const fallback = `User${index + 1}`;
    const pc = state.pcs[index] || defaultPC(index);
    const name = safeText(pc.name || fallback, 24) || fallback;
    return name === fallback ? fallback : `${fallback} (${name})`;
  }

  function findFollowerNpcById(rawId){
    const id = normalizeMonsterTargetFollowerId(rawId);
    if(!id) return null;
    return ensurePartyFollowers().find((npc) => safeText(npc && npc.id ? npc.id : "", 60) === id) || null;
  }

  function resolveMonsterAttackTarget(rawTarget){
    if(rawTarget && typeof rawTarget !== "object"){
      const legacySlot = normalizeMonsterTargetPlayerSlot(rawTarget);
      if(legacySlot === MONSTER_TARGET_NONE){
        return { kind: "none", label: "미설정" };
      }
      return { kind: "pc", slot: legacySlot, label: getPlayerSlotLabel(legacySlot) };
    }
    const target = rawTarget && typeof rawTarget === "object" ? rawTarget : {};
    const followerId = normalizeMonsterTargetFollowerId(target.targetFollowerId ?? target.targetNpcId);
    if(followerId){
      const follower = findFollowerNpcById(followerId);
      if(follower){
        const npcName = safeText(follower.name || "동행 NPC", 40) || "동행 NPC";
        return {
          kind: "npc",
          followerId,
          npc: follower,
          label: `NPC (${npcName})`
        };
      }
    }
    const slot = normalizeMonsterTargetPlayerSlot(target.targetPlayerSlot ?? target.targetSlot);
    if(slot === MONSTER_TARGET_NONE){
      return { kind: "none", label: "미설정" };
    }
    return { kind: "pc", slot, label: getPlayerSlotLabel(slot) };
  }

  function getMonsterTargetPlayerLabel(rawSlot){
    return resolveMonsterAttackTarget({ targetPlayerSlot: rawSlot }).label;
  }

  function getMonsterTargetLabel(monster){
    return resolveMonsterAttackTarget(monster).label;
  }

  function getSelectedMonsterAttackMonster(){
    const id = safeText(selectedMonsterAttackId || "", 60);
    if(!id) return null;
    const found = findActiveMonster(id);
    if(found) return found;
    selectedMonsterAttackId = "";
    return null;
  }

  function toggleSelectedMonsterAttackMonster(monsterId){
    if(!isAdminRole()) return;
    const id = safeText(monsterId || "", 60);
    if(!id){
      selectedMonsterAttackId = "";
      lastAutoDamageDiceAttackType = "";
      render({ skipSync: true });
      return;
    }
    selectedMonsterAttackId = (safeText(selectedMonsterAttackId || "", 60) === id) ? "" : id;
    if(selectedMonsterAttackId){
      const selected = findActiveMonster(selectedMonsterAttackId);
      if(selected){
        setDamageDiceSidesInUi(selected.damageDiceSides, { updateDiceShape: true, resetAutoType: true });
      }
    }else{
      lastAutoDamageDiceAttackType = "";
    }
    render({ skipSync: true });
  }

  function getAdminMonsterAttackSource(){
    if(!isAdminRole()) return null;
    return getSelectedMonsterAttackMonster();
  }

  function buildMonsterTargetBadge(monster){
    const badge = document.createElement("div");
    badge.className = "monsterTargetBadge";
    badge.textContent = `타겟: ${getMonsterTargetLabel(monster)}`;
    return badge;
  }

  function buildMonsterAttackSelectButton(monster, options = {}){
    const id = safeText(monster && monster.id ? monster.id : "", 60);
    const isSelected = id && safeText(selectedMonsterAttackId || "", 60) === id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `monsterAttackPickBtn${isSelected ? " active" : ""}`;
    button.textContent = isSelected ? "공격 선택됨" : "공격 선택";
    button.addEventListener("mousedown", (ev) => {
      if(options.stopSummaryToggle){
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
    button.addEventListener("click", (ev) => {
      if(options.stopSummaryToggle){
        ev.preventDefault();
        ev.stopPropagation();
      }
      toggleSelectedMonsterAttackMonster(id);
    });
    return button;
  }

  function buildMonsterTargetQuickRow(monster){
    const wrap = document.createElement("div");
    wrap.className = "monsterTargetQuickRow";
    const currentTarget = resolveMonsterAttackTarget(monster);
    const currentKey = currentTarget.kind === "pc"
      ? `pc:${currentTarget.slot}`
      : (currentTarget.kind === "npc" ? `npc:${currentTarget.followerId}` : "none");
    const options = [{ kind: "none", key: "none", label: "미설정" }];
    for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
      options.push({ kind: "pc", key: `pc:${slot}`, slot, label: getPlayerSlotLabel(slot) });
    }
    for(const npc of ensurePartyFollowers()){
      const npcId = normalizeMonsterTargetFollowerId(npc && npc.id);
      if(!npcId) continue;
      const npcName = safeText(npc.name || "동행 NPC", 40) || "동행 NPC";
      options.push({ kind: "npc", key: `npc:${npcId}`, followerId: npcId, label: `NPC (${npcName})` });
    }
    for(const option of options){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `monsterTargetQuickBtn${currentKey === option.key ? " active" : ""}`;
      btn.textContent = option.label;
      btn.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        mutateActiveMonster(monster.id, (draft) => {
          if(option.kind === "pc"){
            draft.targetPlayerSlot = option.slot;
            draft.targetFollowerId = "";
            return;
          }
          if(option.kind === "npc"){
            draft.targetFollowerId = option.followerId;
            draft.targetPlayerSlot = MONSTER_TARGET_NONE;
            return;
          }
          draft.targetPlayerSlot = MONSTER_TARGET_NONE;
          draft.targetFollowerId = "";
        });
      });
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function updateSlotSelectLabels(){
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      const label = getPlayerSlotLabel(i);
      ["userSlot", "adminTargetSlot", "adminGrantSlot", "adminInspectSlot", "whisperTargetSlot"].forEach((selectId) => {
        const select = $(selectId);
        if(!select) return;
        const option = select.querySelector(`option[value="${i}"]`);
        if(option) option.textContent = label;
      });
    }
  }

  function getAttackTypeLabel(type){
    if(type === "physical") return "물리";
    if(type === "item") return "아이템";
    return "플라즈마";
  }

  function getShapeLabel(type, shape){
    const attackType = normalizeAttackType(type);
    const normalizedShape = normalizeShapeForType(attackType, shape);
    const options = SHAPE_OPTIONS[attackType] || [];
    const found = options.find((option) => option.value === normalizedShape);
    return found ? found.label : normalizedShape;
  }

  function getIntensityLabel(value){
    const intensity = normalizeIntensity(value);
    if(intensity === "high") return "강";
    if(intensity === "low") return "약";
    return "중";
  }

  function renderActionSetupSummary(){
    const summary = $("actionSetupSummary");
    if(!summary) return;
    const pc = ensurePc(state.activePc);
    const attackType = normalizeAttackType(($("attackType") && $("attackType").value) || "plasma");
    const shape = normalizeShapeForType(attackType, ($("shape") && $("shape").value) || "");
    const distanceRaw = ($("distanceState") && $("distanceState").value) || "close";
    const distance = DISTANCE_KEYS.includes(distanceRaw) ? distanceRaw : "close";
    const attackRangeRaw = ($("attackRangeState") && $("attackRangeState").value) || "close";
    const attackRangeKind = String(attackRangeRaw || "") === "far" ? "far" : "close";
    const intensity = normalizeIntensity(($("intensity") && $("intensity").value) || "mid");
    const multiValue = clamp(toInt(($("multi") && $("multi").value) || 1), 1, 999);
    const distanceLabel = DISTANCE_LABEL[distance] || "가까움";
    const attackRangeLabel = attackRangeKind === "far" ? "원거리" : "근거리";
    const shapeLabel = getShapeLabel(attackType, shape);
    const modeLabel = attackType === "item" ? "아이템" : "공격";
    if(attackType === "plasma"){
      const activeSkill = getPcActivePlasmaSkill(pc);
      if(activeSkill){
        const level = clamp(toInt(activeSkill.level || 1), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX);
        const useAmount = getPlasmaSkillUseAmount(activeSkill);
        summary.textContent = `${modeLabel} · ${shapeLabel} · 강도 ${getIntensityLabel(intensity)} · 적 거리 ${distanceLabel} · 공격 타입 ${attackRangeLabel} · Lv ${level} · 소모 ${useAmount}`;
        return;
      }
      summary.textContent = `${modeLabel} · ${shapeLabel} · 강도 ${getIntensityLabel(intensity)} · 적 거리 ${distanceLabel} · 공격 타입 ${attackRangeLabel} · 소모 ${multiValue}`;
      return;
    }
    summary.textContent = `${modeLabel} · ${getAttackTypeLabel(attackType)} · 적 거리 ${distanceLabel} · 공격 타입 ${attackRangeLabel}`;
  }

  function getMatchedActionPresetKey(){
    const type = normalizeAttackType(($("attackType") && $("attackType").value) || "plasma");
    if(type === "physical") return "attack";
    if(type === "plasma") return "attack";
    if(type === "item") return "item";
    return "";
  }

  function syncActionPresetButtons(){
    const activeKey = getMatchedActionPresetKey();
    const buttons = [
      { id: "actionModeAttack", key: "attack" },
      { id: "actionModeItem", key: "item" }
    ];
    for(const info of buttons){
      const btn = $(info.id);
      if(!btn) continue;
      btn.classList.toggle("active", activeKey === info.key);
    }
  }

  function applyActionPreset(presetKey){
    const key = safeText(presetKey || "", 40);
    if(!key) return;
    const cap = getEffectivePlasmaCap(ensurePc(state.activePc), getStatStep(state.k));
    if(key === "attack"){
      $("attackType").value = "physical";
      autoSelectDamageDiceByAttackType("physical", true);
      syncShapeOptionsByType("physical", "physical_precise");
      $("shape").value = "physical_precise";
      $("intensity").value = "mid";
      $("multi").value = "1";
    }else if(key === "item"){
      $("attackType").value = "item";
      syncShapeOptionsByType("item", "item_instant");
      $("shape").value = "item_instant";
      $("intensity").value = "mid";
      $("multi").value = "1";
    }else{
      return;
    }
    $("multi").max = String(Math.max(1, cap));
    render();
    queueUserActionSync(false);
  }

  function syncPlasmaSkillKindUi(){
    const kindSelect = $("plasmaSkillKind");
    const buffHitWrap = $("plasmaBuffHitWrap");
    const buffPowWrap = $("plasmaBuffPowWrap");
    if(!kindSelect || !buffHitWrap || !buffPowWrap) return;
    const isBuff = String(kindSelect.value || "") === "buff";
    buffHitWrap.style.display = isBuff ? "" : "none";
    buffPowWrap.style.display = isBuff ? "" : "none";
  }

  function ensurePlasmaSkillBonusInputs(){
    const rangeSelect = $("plasmaSkillRange");
    if(!rangeSelect) return;
    const grid = rangeSelect.closest(".grid2");
    if(!grid) return;
    const ensureInput = (id, labelText) => {
      let input = $(id);
      if(input) return input;
      const wrap = document.createElement("div");
      wrap.id = `${id}Wrap`;
      const label = document.createElement("label");
      label.textContent = labelText;
      input = document.createElement("input");
      input.type = "number";
      input.id = id;
      input.min = "-99";
      input.max = "99";
      input.value = "0";
      input.dataset.userAllowed = "1";
      wrap.appendChild(label);
      wrap.appendChild(input);
      grid.appendChild(wrap);
      return input;
    };
    ensureInput("plasmaSkillHitBonus", "적중 보정");
    ensureInput("plasmaSkillPowBonus", "위력 보정");
  }

  function renderPlasmaSkillBook(){
    ensurePlasmaSkillBonusInputs();
    const listWrap = $("plasmaSkillList");
    const nameInput = $("plasmaSkillName");
    const descInput = $("plasmaSkillDesc");
    const rangeSelect = $("plasmaSkillRange");
    const kindSelect = $("plasmaSkillKind");
    const buffHitInput = $("plasmaSkillBuffHit");
    const buffPowInput = $("plasmaSkillBuffPow");
    const hitBonusInput = $("plasmaSkillHitBonus");
    const powBonusInput = $("plasmaSkillPowBonus");
    const baseCostInput = $("plasmaSkillBaseCost");
    const saveBtn = $("plasmaSkillSaveBtn");
    const createDetails = $("plasmaSkillCreateDetails");
    const statusEl = $("plasmaSkillSaveStatus");
    syncPlasmaSkillKindUi();
    if(!listWrap) return;
    const pc = ensurePc(state.activePc);
    const skillBook = normalizePlasmaSkillBook(pc.plasmaSkillBook);
    pc.plasmaSkillBook = skillBook;
    if(editingPlasmaSkillId && !skillBook.some((entry) => entry.id === editingPlasmaSkillId)){
      editingPlasmaSkillId = "";
    }
    if(saveBtn){
      saveBtn.textContent = editingPlasmaSkillId ? "템플릿 수정 저장" : "템플릿 등록";
    }

    if(skillBook.length <= 0){
      listWrap.innerHTML = '<div class="muted">등록된 플라즈마 기술이 없습니다. 아래 [플라즈마 기술 생성]에서 템플릿을 등록하세요.</div>';
      if(statusEl && !statusEl.textContent) statusEl.textContent = "템플릿 미등록";
      return;
    }

    listWrap.innerHTML = "";
    for(const skill of skillBook){
      const rangeLabel = skill.rangeKind === "far" ? "원거리 집중" : "근거리 집중";
      const skillKindLabel = skill.skillKind === "aoe" ? "광역기" : (skill.skillKind === "buff" ? "강화기" : "일격기");
      const level = clamp(toInt(skill.level || 1), PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX);

      const card = document.createElement("article");
      card.className = "plasmaSkillCard";
      if(safeText(pc.activePlasmaSkillId || "", 60) === skill.id){
        card.classList.add("active");
      }

      const top = document.createElement("div");
      top.className = "plasmaSkillTop";

      const title = document.createElement("div");
      title.className = "plasmaSkillName";
      title.textContent = skill.name;

      const tags = document.createElement("div");
      tags.className = "plasmaSkillTags";
      const tagRange = document.createElement("span");
      tagRange.className = "plasmaSkillTag";
      tagRange.textContent = rangeLabel;
      const tagKind = document.createElement("span");
      tagKind.className = "plasmaSkillTag";
      tagKind.textContent = skillKindLabel;
      const tagCost = document.createElement("span");
      tagCost.className = "plasmaSkillTag";
      tagCost.textContent = `Lv ${level}`;
      tags.appendChild(tagRange);
      tags.appendChild(tagKind);
      tags.appendChild(tagCost);
      if(skill.skillKind === "buff"){
        const tagBuff = document.createElement("span");
        tagBuff.className = "plasmaSkillTag";
        tagBuff.textContent = `팀 +${clamp(toInt(skill.buffHit), 0, 99)} / +${clamp(toInt(skill.buffPow), 0, 99)}`;
        tags.appendChild(tagBuff);
      }

      top.appendChild(title);
      top.appendChild(tags);

      const desc = document.createElement("div");
      desc.className = "plasmaSkillDesc";
      desc.textContent = safeText(skill.desc || "", 180) || "기술 설명 없음";

      const bottom = document.createElement("div");
      bottom.className = "plasmaSkillBottom";

      const costWrap = document.createElement("div");
      costWrap.className = "plasmaSkillCost";
      const useAmount = getPlasmaSkillUseAmount(skill);
      const dots = document.createElement("div");
      dots.className = "plasmaSkillCostDots";
      const visibleDots = Math.min(useAmount, 8);
      for(let i = 0; i < visibleDots; i += 1){
        const dot = document.createElement("span");
        dot.className = "plasmaSkillCostDot";
        dots.appendChild(dot);
      }
      if(useAmount > visibleDots){
        const more = document.createElement("span");
        more.className = "plasmaSkillCostMore";
        more.textContent = `+${useAmount - visibleDots}`;
        dots.appendChild(more);
      }
      const costText = document.createElement("span");
      costText.className = "plasmaSkillCostText";
      costText.textContent = `Lv ${level} · 소모 ${useAmount}`;

      const levelCtrl = document.createElement("div");
      levelCtrl.className = "plasmaSkillLevelCtrl";
      const levelDownBtn = document.createElement("button");
      levelDownBtn.type = "button";
      levelDownBtn.textContent = "-";
      levelDownBtn.dataset.userAllowed = "1";
      levelDownBtn.disabled = level <= PLASMA_SKILL_LEVEL_MIN;
      const levelValue = document.createElement("span");
      levelValue.className = "plasmaSkillLevelValue";
      levelValue.textContent = `Lv ${level}`;
      const levelUpBtn = document.createElement("button");
      levelUpBtn.type = "button";
      levelUpBtn.textContent = "+";
      levelUpBtn.dataset.userAllowed = "1";
      levelUpBtn.disabled = level >= PLASMA_SKILL_LEVEL_MAX;
      const applyLevel = (delta) => {
        state.pcs[state.activePc] = readPcFromUI();
        const draftPc = ensurePc(state.activePc);
        const nextBook = normalizePlasmaSkillBook(draftPc.plasmaSkillBook).map((entry) => {
          if(entry.id !== skill.id) return entry;
          return normalizePlasmaSkillEntry({
            ...entry,
            level: clamp(toInt(entry.level || 1) + delta, PLASMA_SKILL_LEVEL_MIN, PLASMA_SKILL_LEVEL_MAX)
          });
        });
        draftPc.plasmaSkillBook = nextBook;
        draftPc.plasmaSkillBookUpdatedAt = Date.now();
        const changed = nextBook.find((entry) => entry.id === skill.id);
        if(changed && safeText(draftPc.activePlasmaSkillId || "", 60) === changed.id){
          const cap = getEffectivePlasmaCap(draftPc, getStatStep(state.k));
          draftPc.multi = clamp(getPlasmaSkillUseAmount(changed), 1, cap);
        }
        if(statusEl && changed){
          statusEl.textContent = `레벨 변경: ${changed.name} Lv ${changed.level} (소모 ${getPlasmaSkillUseAmount(changed)} | 보정식: 현재 PC 계산결과 x,y 기준)`;
        }
        render();
        saveLocal();
        if(!isAdminRole()) queueUserActionSync(true);
      };
      levelDownBtn.addEventListener("click", () => applyLevel(-1));
      levelUpBtn.addEventListener("click", () => applyLevel(1));
      levelCtrl.appendChild(levelDownBtn);
      levelCtrl.appendChild(levelValue);
      levelCtrl.appendChild(levelUpBtn);
      costWrap.appendChild(dots);
      costWrap.appendChild(costText);
      costWrap.appendChild(levelCtrl);

      const right = document.createElement("div");
      right.className = "listActions";
      const baseHitBonus = clamp(toInt(skill.hitBonus), -99, 99);
      const basePowBonus = clamp(toInt(skill.powBonus), -99, 99);
      const bonusInfo = document.createElement("div");
      bonusInfo.className = "small muted";
      bonusInfo.textContent = `기본 적중 ${formatSignedNumber(baseHitBonus)} · 기본 위력 ${formatSignedNumber(basePowBonus)}`;
      if(level > PLASMA_SKILL_LEVEL_MIN){
        bonusInfo.title = level === 2
          ? "Lv2: floor(x-(1+y/2)), floor(y+(1+y/2)) | x,y=현재 PC 계산결과"
          : "Lv3: floor(x-(3+y/2)), floor(y+(2+2*(y/2))) | x,y=현재 PC 계산결과";
      }
      right.appendChild(bonusInfo);

      const applyBtn = document.createElement("button");
      applyBtn.type = "button";
      applyBtn.textContent = "적용";
      applyBtn.dataset.userAllowed = "1";
      applyBtn.addEventListener("click", () => {
        $("attackType").value = "plasma";
        autoSelectDamageDiceByAttackType("plasma", true);
        const mappedShape = skill.skillKind === "aoe"
          ? "spread"
          : (skill.skillKind === "buff" ? "stabilize" : "single");
        syncShapeOptionsByType("plasma", mappedShape);
        $("shape").value = normalizeShapeForType("plasma", mappedShape);
        $("intensity").value = "mid";
        const cap = getEffectivePlasmaCap(ensurePc(state.activePc), getStatStep(state.k));
        $("multi").max = String(Math.max(1, cap));
        $("multi").value = String(clamp(getPlasmaSkillUseAmount(skill), 1, cap));
        if(rangeSelect) rangeSelect.value = skill.rangeKind === "far" ? "far" : "close";
        if(kindSelect) kindSelect.value = ["strike", "aoe", "buff"].includes(skill.skillKind) ? skill.skillKind : "strike";
        if(baseCostInput) baseCostInput.value = String(clamp(toInt(skill.baseCost || 1), 1, 99));
        if(buffHitInput) buffHitInput.value = String(clamp(toInt(skill.buffHit), 0, 99));
        if(buffPowInput) buffPowInput.value = String(clamp(toInt(skill.buffPow), 0, 99));
        if(hitBonusInput) hitBonusInput.value = String(clamp(toInt(skill.hitBonus), -99, 99));
        if(powBonusInput) powBonusInput.value = String(clamp(toInt(skill.powBonus), -99, 99));
        if(nameInput) nameInput.value = skill.name;
        if(descInput) descInput.value = safeText(skill.desc || "", 180);
        editingPlasmaSkillId = "";
        if(saveBtn) saveBtn.textContent = "템플릿 등록";
        const skillRangeLabel = skill.rangeKind === "far" ? "원거리 집중" : "근거리 집중";
        if(statusEl) statusEl.textContent = `템플릿 적용됨: ${skill.name} (${skillRangeLabel})`;
        state.pcs[state.activePc] = readPcFromUI();
        state.pcs[state.activePc].activePlasmaSkillId = skill.id;
        syncPlasmaSkillKindUi();
        render();
        if(!isAdminRole()) queueUserActionSync(true);
      });
      right.appendChild(applyBtn);

      if(isAdminRole()){
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "수정";
        editBtn.addEventListener("click", () => {
          editingPlasmaSkillId = skill.id;
          if(nameInput) nameInput.value = skill.name;
          if(descInput) descInput.value = safeText(skill.desc || "", 180);
          if(rangeSelect) rangeSelect.value = skill.rangeKind === "far" ? "far" : "close";
          if(kindSelect) kindSelect.value = ["strike", "aoe", "buff"].includes(skill.skillKind) ? skill.skillKind : "strike";
          if(baseCostInput) baseCostInput.value = String(clamp(toInt(skill.baseCost || 1), 1, 99));
          if(buffHitInput) buffHitInput.value = String(clamp(toInt(skill.buffHit), 0, 99));
          if(buffPowInput) buffPowInput.value = String(clamp(toInt(skill.buffPow), 0, 99));
          if(hitBonusInput) hitBonusInput.value = String(clamp(toInt(skill.hitBonus), -99, 99));
          if(powBonusInput) powBonusInput.value = String(clamp(toInt(skill.powBonus), -99, 99));
          if(saveBtn) saveBtn.textContent = "템플릿 수정 저장";
          if(createDetails) createDetails.open = true;
          syncPlasmaSkillKindUi();
          if(statusEl) statusEl.textContent = `수정 모드: ${skill.name}`;
        });
        right.appendChild(editBtn);
      }

      if(isAdminRole()){
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "삭제";
        removeBtn.addEventListener("click", () => {
          state.pcs[state.activePc] = readPcFromUI();
          const draftPc = ensurePc(state.activePc);
          draftPc.plasmaSkillBook = normalizePlasmaSkillBook(draftPc.plasmaSkillBook)
            .filter((entry) => entry.id !== skill.id);
          draftPc.plasmaSkillBookUpdatedAt = Date.now();
          if(safeText(draftPc.activePlasmaSkillId || "", 60) === skill.id){
            draftPc.activePlasmaSkillId = "";
          }
          if(editingPlasmaSkillId === skill.id){
            editingPlasmaSkillId = "";
            if(saveBtn) saveBtn.textContent = "템플릿 등록";
          }
          if(statusEl) statusEl.textContent = `템플릿 삭제됨: ${skill.name}`;
          render();
          saveLocal();
          if(!isAdminRole()) queueUserActionSync(true);
        });
        right.appendChild(removeBtn);
      }

      bottom.appendChild(costWrap);
      bottom.appendChild(right);
      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(bottom);
      listWrap.appendChild(card);
    }
  }

  function saveCurrentAsPlasmaSkill(){
    ensurePlasmaSkillBonusInputs();
    const nameInput = $("plasmaSkillName");
    const descInput = $("plasmaSkillDesc");
    const rangeSelect = $("plasmaSkillRange");
    const kindSelect = $("plasmaSkillKind");
    const buffHitInput = $("plasmaSkillBuffHit");
    const buffPowInput = $("plasmaSkillBuffPow");
    const hitBonusInput = $("plasmaSkillHitBonus");
    const powBonusInput = $("plasmaSkillPowBonus");
    const baseCostInput = $("plasmaSkillBaseCost");
    const saveBtn = $("plasmaSkillSaveBtn");
    const statusEl = $("plasmaSkillSaveStatus");
    if(!nameInput || !rangeSelect || !kindSelect || !baseCostInput) return;
    const name = safeText(nameInput.value, 40);
    if(!name){
      alert("기술 이름을 입력해주세요.");
      return;
    }

    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    const rangeKind = String(rangeSelect.value || "") === "far" ? "far" : "close";
    const skillKind = ["strike", "aoe", "buff"].includes(String(kindSelect.value || ""))
      ? String(kindSelect.value)
      : "strike";
    const buffHit = skillKind === "buff" ? clamp(toInt((buffHitInput && buffHitInput.value) || 0), 0, 99) : 0;
    const buffPow = skillKind === "buff" ? clamp(toInt((buffPowInput && buffPowInput.value) || 0), 0, 99) : 0;
    const hitBonus = clamp(toInt((hitBonusInput && hitBonusInput.value) || 0), -99, 99);
    const powBonus = clamp(toInt((powBonusInput && powBonusInput.value) || 0), -99, 99);
    const currentBook = normalizePlasmaSkillBook(pc.plasmaSkillBook);
    const editingEntry = editingPlasmaSkillId
      ? currentBook.find((entry) => entry.id === editingPlasmaSkillId)
      : null;
    const next = normalizePlasmaSkillEntry({
      id: editingEntry ? editingEntry.id : makeId("pskill"),
      name,
      rangeKind,
      skillKind,
      baseCost: clamp(toInt(baseCostInput.value || 1), 1, 99),
      desc: safeText((descInput && descInput.value) || "", 180),
      level: editingEntry ? editingEntry.level : PLASMA_SKILL_LEVEL_MIN,
      buffHit,
      buffPow,
      hitBonus,
      powBonus
    }, (Array.isArray(pc.plasmaSkillBook) ? pc.plasmaSkillBook.length : 0));

    const book = currentBook.slice();
    const duplicateIndex = book.findIndex((entry) => safeText(entry.name || "", 40) === next.name && entry.id !== next.id);
    if(duplicateIndex >= 0 && !isAdminRole()){
      alert("같은 이름의 템플릿이 이미 있습니다. 수정은 GM만 가능합니다.");
      return;
    }

    if(editingEntry){
      const targetIndex = book.findIndex((entry) => entry.id === editingEntry.id);
      if(targetIndex >= 0) book[targetIndex] = next;
      else book.push(next);
    }else if(duplicateIndex >= 0){
      book[duplicateIndex] = next;
    }else{
      book.push(next);
    }

    pc.plasmaSkillBook = normalizePlasmaSkillBook(book);
    pc.plasmaSkillBookUpdatedAt = Date.now();
    pc.activePlasmaSkillId = next.id;
    editingPlasmaSkillId = "";
    if(saveBtn) saveBtn.textContent = "템플릿 등록";
    syncPlasmaSkillKindUi();

    if(statusEl) statusEl.textContent = `템플릿 등록됨: ${next.name}`;
    render();
    saveLocal();
    if(!isAdminRole()) queueUserActionSync(true);
  }

  function getActorLabel(slot, role){
    if(role === "admin") return "관리자";
    const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    const pc = state.pcs[idx] || defaultPC(idx);
    const name = safeText(pc.name || `User${idx + 1}`, 24) || `User${idx + 1}`;
    return name;
  }

  function pushSessionLog(entry, options = {}){
    state.logs = (Array.isArray(state.logs) ? state.logs : []);
    state.logs.push(normalizeLogEntry(entry, state.logs.length));
    if(state.logs.length > LOG_LIMIT){
      state.logs = state.logs.slice(-LOG_LIMIT);
    }
    renderSessionLogs();
    if(options.persist !== false) saveLocal();
    if(options.sync !== false) queueAdminSync(true);
  }

  function renderSessionLogs(){
    const wrap = $("chatLogList");
    if(!wrap) return;
    const allLogs = Array.isArray(state.logs) ? state.logs : [];
    const logs = allLogs.slice(-CHAT_RENDER_LIMIT);
    if(logs.length === 0){
      wrap.innerHTML = '<div class="muted">아직 기록이 없습니다.</div>';
      return;
    }
    wrap.innerHTML = "";
    if(allLogs.length > logs.length){
      const clipped = document.createElement("div");
      clipped.className = "small muted";
      clipped.textContent = `이전 로그 ${allLogs.length - logs.length}개는 생략됨`;
      wrap.appendChild(clipped);
    }
    for(const log of logs){
      const kind = log.kind === "roll" ? "판정" : (log.kind === "system" ? "시스템" : "채팅");
      const row = document.createElement("div");
      row.className = "small chatLogRow";
      row.textContent = `[${formatClock(log.ts)}][${kind}] ${log.author} | ${log.text}`;
      wrap.appendChild(row);
    }
    wrap.scrollTop = wrap.scrollHeight;
  }

  function setWhisperLogs(logs){
    const list = Array.isArray(logs) ? logs : [];
    whisperLogs = list.map((entry, index) => normalizeWhisperEntry(entry, index)).slice(-LOG_LIMIT);
    renderWhisperLogs();
  }

  function renderWhisperLogs(){
    const wrap = $("whisperLogList");
    if(!wrap) return;
    const logs = Array.isArray(whisperLogs) ? whisperLogs : [];
    if(logs.length === 0){
      wrap.innerHTML = '<div class="muted">아직 귓속말 기록이 없습니다.</div>';
      return;
    }
    const admin = isAdminRole();
    wrap.innerHTML = "";
    for(const log of logs){
      const row = document.createElement("div");
      row.className = "small whisperRow";
      const targetLabel = getPlayerSlotLabel(log.userSlot);
      const direction = admin
        ? (log.authorRole === "admin" ? `GM → ${targetLabel}` : `${targetLabel} → GM`)
        : (log.authorRole === "admin" ? "GM → 나" : "나 → GM");
      row.textContent = `[${formatClock(log.ts)}] ${direction} | ${log.text}`;
      wrap.appendChild(row);
    }
    wrap.scrollTop = wrap.scrollHeight;
  }

  function sendWhisperMessage(){
    const input = $("whisperInput");
    if(!input) return;
    const text = safeText(input.value, 180);
    if(!text) return;
    if(!socket || !socket.connected){
      alert("실시간 연결 후 귓속말을 보낼 수 있습니다.");
      return;
    }
    const roomId = getRoomId();
    if(awaitingRoomState || normalizeRoomId(joinedRoomId) !== roomId){
      emitJoinRoom();
      alert("방 동기화 중입니다. 잠시 후 다시 전송해주세요.");
      return;
    }

    if(isAdminRole()){
      const targetSlot = clamp(toInt($("whisperTargetSlot").value), 0, MAX_PLAYERS - 1);
      socket.emit("gm_whisper_reply", {
        roomId,
        userSlot: targetSlot,
        text
      }, (ack) => {
        if(!ack || ack.ok !== true){
          const reason = safeText(ack && ack.reason ? ack.reason : "귓속말 전송 실패", 120);
          alert(reason);
          return;
        }
        input.value = "";
      });
    }else{
      socket.emit("whisper_to_gm", {
        roomId,
        userSlot: getUserSlot(),
        text
      }, (ack) => {
        if(!ack || ack.ok !== true){
          const reason = safeText(ack && ack.reason ? ack.reason : "귓속말 전송 실패", 120);
          alert(reason);
          return;
        }
        input.value = "";
      });
    }
  }

  function sendChatMessage(){
    const text = safeText($("chatInput").value, 180);
    if(!text) return;

    const roomId = getRoomId();
    const joined = normalizeRoomId(joinedRoomId) === roomId;
    const connected = !!(socket && socket.connected && !awaitingRoomState && joined);
    if(connected){
      socket.emit("chat_send", {
        roomId,
        userSlot: isAdminRole() ? state.activePc : getUserSlot(),
        text
      });
      $("chatInput").value = "";
      return;
    }

    if(!isAdminRole()){
      if(socket && socket.connected){
        emitJoinRoom();
        alert("방 동기화 중입니다. 잠시 후 다시 전송해주세요.");
        return;
      }
      alert("실시간 연결 후 채팅을 보낼 수 있습니다.");
      return;
    }
    if(socket && socket.connected){
      emitJoinRoom();
      alert("방 동기화 중입니다. 잠시 후 다시 전송해주세요.");
      return;
    }

    pushSessionLog({
      id: makeId("log"),
      ts: Date.now(),
      kind: "chat",
      author: getActorLabel(state.activePc, "admin"),
      text
    }, { sync: false });
    $("chatInput").value = "";
  }

  function clearSessionLogs(){
    if(!isAdminRole()) return;

    if(socket && socket.connected){
      socket.emit("admin_clear_logs", { roomId: getRoomId() });
      return;
    }

    state.logs = [];
    renderSessionLogs();
    saveLocal();
  }

  function emitRollOutcome(text){
    if(!text) return;
    const cleanText = safeText(text, 220);

    if(isAdminRole()){
      const roomId = getRoomId();
      const joined = normalizeRoomId(joinedRoomId) === roomId;
      const connected = !!(socket && socket.connected && !awaitingRoomState && joined);
      if(connected){
        socket.emit("roll_outcome", {
          roomId,
          userSlot: state.activePc,
          text: cleanText
        });
      }else{
        pushSessionLog({
          id: makeId("log"),
          ts: Date.now(),
          kind: "roll",
          author: getActorLabel(state.activePc, "admin"),
          text: cleanText
        }, { sync: false });
      }
      return;
    }

    if(!socket || !socket.connected){
      pushSessionLog({
        id: makeId("log"),
        ts: Date.now(),
        kind: "roll",
        author: getActorLabel(getUserSlot(), "user"),
        text: cleanText
      }, { sync: false });
      return;
    }

    socket.emit("roll_outcome", {
      roomId: getRoomId(),
      userSlot: getUserSlot(),
      text: cleanText
    });
  }

  function isDrawerOpen(drawerId){
    const drawer = $(drawerId);
    return !!(drawer && drawer.classList.contains("open"));
  }

  function syncDrawerLayoutOffsets(){
    const root = document.documentElement;
    const adminOpen = isAdminRole() && isDrawerOpen("adminDrawer");
    const userOpen = isDrawerOpen("userDrawer");
    const body = document.body;

    const left = adminOpen ? Math.round($("adminDrawer").getBoundingClientRect().width + 20) : 0;
    const right = userOpen ? Math.round($("userDrawer").getBoundingClientRect().width + 20) : 0;
    const viewport = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 0);
    const usableWidth = Math.max(320, viewport - left - right);
    // Keep layout breakpoints stable while toggling the right inventory drawer.
    const layoutWidth = Math.max(320, viewport - left);

    root.style.setProperty("--layout-left-offset", `${left}px`);
    root.style.setProperty("--layout-right-offset", `${right}px`);

    if(isAdminRole()){
      const leftCol = userOpen ? "0.82fr" : "0.9fr";
      const rightCol = userOpen ? "1.18fr" : "1.1fr";
      root.style.setProperty("--gm-main-left-col", leftCol);
      root.style.setProperty("--gm-main-right-col", rightCol);
    }else{
      root.style.setProperty("--gm-main-left-col", "1fr");
      root.style.setProperty("--gm-main-right-col", "1fr");
    }

    body.classList.toggle("gm-user-drawer-open", isAdminRole() && userOpen);
    body.classList.toggle("gm-user-drawer-closed", isAdminRole() && !userOpen);
    body.classList.toggle("user-drawer-open", !isAdminRole() && userOpen);
    body.classList.toggle("user-drawer-closed", !isAdminRole() && !userOpen);

    const compactThreshold = isAdminRole() ? 1380 : 1020;
    const ultraCompactThreshold = isAdminRole() ? 980 : 760;
    body.classList.toggle("layout-compact", layoutWidth < compactThreshold);
    body.classList.toggle("layout-ultra-compact", layoutWidth < ultraCompactThreshold);
  }

  function setMonsterCategoryOpen(open){
    monsterCategoryOpen = !!open;
    const panel = $("monsterOpsPanel");
    const templatePanel = $("monsterPanel");
    const balance = $("gmBalanceControls");
    const tabs = $("gmPanelTabs");
    const tabBalance = $("gmPanelTabBalance");
    const tabMonster = $("gmPanelTabMonster");
    const allow = isAdminRole();
    const showMonsterPanel = allow ? monsterCategoryOpen : true;
    if(panel) panel.style.display = showMonsterPanel ? "" : "none";
    if(templatePanel) templatePanel.style.display = (allow && showMonsterPanel) ? "" : "none";
    if(balance) balance.style.display = allow ? (showMonsterPanel ? "none" : "") : "none";
    if(tabs) tabs.style.display = allow ? "" : "none";
    if(tabBalance){
      tabBalance.classList.toggle("active", !showMonsterPanel);
      tabBalance.setAttribute("aria-selected", !showMonsterPanel ? "true" : "false");
    }
    if(tabMonster){
      tabMonster.classList.toggle("active", showMonsterPanel);
      tabMonster.setAttribute("aria-selected", showMonsterPanel ? "true" : "false");
    }
  }

  function syncDrawerToggleText(){
    const adminOpen = isDrawerOpen("adminDrawer");
    const userOpen = isDrawerOpen("userDrawer");
    $("adminDrawerToggle").textContent = `${adminOpen ? "◀" : "▶"} 운영자 인벤`;
    $("userDrawerToggle").textContent = `플레이어 인벤 ${userOpen ? "▶" : "◀"}`;
    $("adminDrawerToggle").classList.toggle("hidden", adminOpen);
    $("userDrawerToggle").classList.toggle("hidden", userOpen);
    syncDrawerLayoutOffsets();
  }

  function setDrawerOpen(drawerId, open){
    const drawer = $(drawerId);
    if(!drawer) return;
    drawer.classList.toggle("open", !!open);
    syncDrawerToggleText();
  }

  function toggleDrawer(drawerId){
    setDrawerOpen(drawerId, !isDrawerOpen(drawerId));
  }

  function isMapViewerOpen(){
    const viewer = $("mapViewer");
    return !!(viewer && viewer.classList.contains("active"));
  }

  function openMapViewer(){
    const viewer = $("mapViewer");
    if(!viewer) return;
    viewer.classList.add("active");
    viewer.setAttribute("aria-hidden", "false");
    const closeBtn = $("mapViewerCloseBtn");
    if(closeBtn) closeBtn.focus();
  }

  function closeMapViewer(options = {}){
    const viewer = $("mapViewer");
    if(!viewer) return;
    if(!viewer.classList.contains("active")) return;
    viewer.classList.remove("active");
    viewer.setAttribute("aria-hidden", "true");
    if(options.focusTrigger){
      const openBtn = $("userMapOpenBtn");
      if(openBtn) openBtn.focus();
    }
  }

  function updateHeaderVisibilityByScroll(){
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const delta = y - lastScrollY;
    const topRevealY = 18;
    const isHidden = document.body.classList.contains("header-hidden");

    if(y <= topRevealY){
      document.body.classList.remove("header-hidden");
      headerHideTravel = 0;
      headerRevealTravel = 0;
      lastScrollY = y;
      headerScrollTicking = false;
      return;
    }

    if(delta > 0){
      if(!isHidden){
        document.body.classList.add("header-hidden");
      }
    }else if(delta < 0){
      // Keep header hidden while browsing; reveal only near top.
    }

    lastScrollY = y;
    headerScrollTicking = false;
  }

  function repairCorruptedUiText(){
    const setText = (selector, text) => {
      const el = typeof selector === "string" ? document.querySelector(selector) : selector;
      if(!el) return;
      el.textContent = text;
    };
    const setAttr = (selector, attr, value) => {
      const el = typeof selector === "string" ? document.querySelector(selector) : selector;
      if(!el) return;
      el.setAttribute(attr, value);
    };
    const setById = (id, text) => {
      const el = $(id);
      if(!el) return;
      el.textContent = text;
    };
    const setPlaceholder = (id, text) => {
      const el = $(id);
      if(!el) return;
      el.placeholder = text;
    };
    const setFieldLabel = (id, text) => {
      const input = $(id);
      if(!input) return;
      let label = null;
      if(input.id){
        try{
          label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
        }catch(_err){
          label = null;
        }
      }
      if(!label){
        const parent = input.closest("div");
        if(parent){
          label = parent.querySelector(":scope > label") || parent.querySelector("label");
        }
      }
      if(label) label.textContent = text;
    };
    const setOptionText = (selectId, value, text) => {
      const sel = $(selectId);
      if(!sel) return;
      const opt = sel.querySelector(`option[value="${value}"]`);
      if(opt) opt.textContent = text;
    };

    document.title = "메라노더 TRPG: GM 밸런스 + 3인 시트 + 다이스 헬퍼";
    setText("header .headerTitleRow h1", "TRPG 메러맨");
    setById("adminAuthBtn", "관리자용 <-");
    setById("userMapOpenBtn", "지도 보기");
    setById("mapViewerCloseBtn", "닫기");
    setText("#mapViewer .mapViewerTitle", "TRPG 지도");
    setAttr("#mapViewerImage", "alt", "TRPG 지도");

    setText("#judgeBasicPanel .t", "판정 기준");
    setFieldLabel("dc", "기본 DC");
    setFieldLabel("enemyEva", "적 DC 보정");
    const showDcWrap = document.querySelector('label[for="showDcToUsers"] span');
    if(showDcWrap) showDcWrap.textContent = "플레이어에게 목표 DC 공개";

    setText(".headerWhisper .t", "귓속말 to GM");
    setFieldLabel("whisperTargetSlot", "대상 플레이어");
    setFieldLabel("whisperInput", "메시지 입력");
    setPlaceholder("whisperInput", "운영자에게 비밀 메시지 전송");
    setById("whisperSendBtn", "귓속말 전송");

    setText(".headerChat .t", "세션 로그 / 채팅");
    setFieldLabel("chatInput", "메시지 입력");
    setPlaceholder("chatInput", "메시지 입력 후 전송");
    setById("chatSendBtn", "전송");
    setById("chatClearBtn", "로그 클리어");

    setById("gmCardTitle", "GM 밸런스 계수");
    setAttr("#gmPanelTabs", "aria-label", "GM 패널 전환");
    setById("gmPanelTabBalance", "밸런스");
    setById("gmPanelTabMonster", "몬스터");
    setById("gmCardDesc", "아래 계수는 PC 3명에게 공통 적용됩니다.");

    setById("monsterPanelTitle", "몬스터 운영");
    setById("monsterPanelDesc", "현재 전투 몬스터를 등록/관리합니다.");
    setFieldLabel("activeMonsterTemplateSelect", "추가할 몬스터 템플릿");
    setById("activeMonsterCreateFromTemplateBtn", "몬스터 추가");
    setFieldLabel("activeMonsterFocusSelect", "관리 대상 필터");
    setById("encounterApplyBtn", "전투 적용");
    setById("encounterHideBtn", "전투 숨김");

    setFieldLabel("monsterName", "이름");
    setFieldLabel("monsterKind", "분류");
    setFieldLabel("monsterHp", "체력(선택)");
    setFieldLabel("monsterDc", "DC");
    setFieldLabel("monsterEvaInput", "회피");
    setFieldLabel("monsterDcPublic", "DC 공개");
    setOptionText("monsterDcPublic", "0", "비공개");
    setOptionText("monsterDcPublic", "1", "공개");
    setFieldLabel("monsterDcBonus", "DC 보너스");
    setFieldLabel("monsterAttackHitBonus", "적중보정");
    setFieldLabel("monsterExtraDamage", "추가 데미지");
    setFieldLabel("monsterDamageDiceSides", "기본 피해 주사위");
    setFieldLabel("monsterNote", "메모");
    setPlaceholder("monsterNote", "특수 규칙 (줄바꿈 허용)");
    setFieldLabel("monsterImageFile", "몬스터 이미지");
    setById("applyMonsterImageBtn", "적용");
    setById("clearMonsterImageBtn", "제거");
    setAttr("#monsterImagePreview", "alt", "몬스터 이미지 미리보기");
    setById("monsterCreateBtn", "몬스터 템플릿 저장");
    setById("monsterCancelEditBtn", "수정 취소");

    setFieldLabel("encounterMode", "전투 구성");
    setFieldLabel("encounterSharedMonster", "공통 대상");
    setFieldLabel("encounterSwarmCount", "무리 수(무리 전용)");
    setFieldLabel("encounterPcMonster0", "PC1 대상");
    setFieldLabel("encounterPcMonster1", "PC2 대상");
    setFieldLabel("encounterPcMonster2", "PC3 대상");
    setFieldLabel("playerTargetMonsterSelect", "내 대상 몬스터");

    setFieldLabel("damageAmount", "빠른 PC 피해/회복 수치");
    setFieldLabel("pcQuickDamageAmount", "빠른 PC 피해/회복 수치");
    setById("applyDamageBtn", "피해 적용");
    setById("applyHealBtn", "회복 적용");
    setById("pushLocalToServerBtn", "로컬 값 서버에 적용");

    setFieldLabel("adminTargetSlot", "대상 플레이어");
    setFieldLabel("grantPointAmount", "지급 포인트");
    setById("grantPointsBtn", "포인트 지급");
    setFieldLabel("adminStatName", "수정 항목");
    setFieldLabel("adminStatValue", "수정 값");
    setFieldLabel("gm_close_str_pow_step", "근거리 위력(근력): N당");
    setFieldLabel("gm_close_str_pow_gain", "근거리 위력(근력): 증가값");
    setFieldLabel("gm_close_dex_pow_step", "근거리 위력(민첩): N당");
    setFieldLabel("gm_close_dex_pow_gain", "근거리 위력(민첩): 증가값");
    setFieldLabel("gm_far_plasma_pow_step", "원거리 위력(플라즈마): N당");
    setFieldLabel("gm_far_plasma_pow_gain", "원거리 위력(플라즈마): 증가값");
    setFieldLabel("gm_far_int_pow_step", "원거리 위력(지능): N당");
    setFieldLabel("gm_far_int_pow_gain", "원거리 위력(지능): 증가값");
    setFieldLabel("plasmaSkillHitBonus", "적중 보정");
    setFieldLabel("plasmaSkillPowBonus", "위력 보정");
    setById("adminSetStatBtn", "스탯 반영");
    setById("adminPlasmaPlusOneBtn", "+1 회복");
    setById("adminPlasmaFullBtn", "풀회복");
    setFieldLabel("goldAmount", "골드 수치");
    setById("grantGoldBtn", "골드 지급");
    setById("takeGoldBtn", "골드 회수");

    setById("adminCreateItemBtn", "템플릿 저장");
    setById("adminCancelItemEditBtn", "수정 취소");
    setById("adminGrantItemBtn", "선택 템플릿 지급");
    setPlaceholder("adminItemDesc", "효과/설명 입력 (줄바꿈: Shift+Enter)");

    ensureAdminNpcDcField();
    setPlaceholder("adminNpcName", "예: 로엔 경비");
    setPlaceholder("adminNpcNote", "예: 방어 태세 유지");
    setFieldLabel("adminNpcDc", "DC");
    setFieldLabel("adminNpcHitBonus", "적중 보정");
    setFieldLabel("adminNpcPowBonus", "위력 보정");
    setById("adminNpcAddBtn", "동행 NPC 추가");
    setById("adminNpcTemplateApplyBtn", "값 불러오기");
    setById("adminNpcTemplateDeleteBtn", "템플릿 삭제");
    setById("adminNpcTemplateSaveBtn", "현재 값 템플릿 저장");
    setById("adminNpcImageApplyBtn", "적용");
    setById("adminNpcImageClearBtn", "제거");
    setAttr("#adminNpcImagePreview", "alt", "NPC 이미지 미리보기");
    setById("adminClearStatusBtn", "상태이상 초기화");

    setById("pcQuickDamageBtn", "피해 적용");
    setById("pcQuickHealBtn", "회복 적용");
    setAttr("#pcResetBtn", "title", "현재 PC 초기화");
    setAttr("#pcResetBtn", "aria-label", "현재 PC 초기화");
    setText("#pcResetBtn", "⟲");

    for(let i = 0; i < MAX_PLAYERS; i += 1){
      const card = $(`playerCard${i}`);
      if(card){
        const hitLabel = card.querySelector(".alwaysModRow .alwaysModLabel");
        if(hitLabel) hitLabel.textContent = "적중";
        const powLabel = card.querySelector(".alwaysModRow:nth-child(3) .alwaysModLabel");
        if(powLabel) powLabel.textContent = "위력";
        const distanceLabel = card.querySelector(".alwaysDistanceRow .alwaysModLabel");
        if(distanceLabel) distanceLabel.textContent = "적 거리";
        const attackRangeLabel = card.querySelector(".alwaysAttackRangeRow .alwaysModLabel");
        if(attackRangeLabel) attackRangeLabel.textContent = "공격 타입";
      }
      const hunger = $(`playerHunger${i}`);
      if(hunger) hunger.setAttribute("aria-label", "허기 상태");
      const status = $(`playerStatus${i}`);
      if(status) status.setAttribute("aria-label", "상태이상");
      const injury = $(`injuryBoard${i}`);
      if(injury) injury.setAttribute("aria-label", `User${i + 1} 부위 상태`);
      const dsel = $(`distanceQuick${i}`);
      if(dsel){
        dsel.setAttribute("aria-label", `User${i + 1} 적 거리 선택`);
      }
      const arsel = $(`attackRangeQuick${i}`);
      if(arsel){
        arsel.setAttribute("aria-label", `User${i + 1} 공격 타입 선택`);
      }
      setOptionText(`distanceQuick${i}`, "very_close", "매우 가까움");
      setOptionText(`distanceQuick${i}`, "close", "가까움");
      setOptionText(`distanceQuick${i}`, "far", "멀음");
      setOptionText(`distanceQuick${i}`, "very_far", "매우 멀음");
      setOptionText(`attackRangeQuick${i}`, "close", "근거리");
      setOptionText(`attackRangeQuick${i}`, "far", "원거리");
    }

    setOptionText("distanceState", "very_close", "매우 가까움");
    setOptionText("distanceState", "close", "가까움");
    setOptionText("distanceState", "far", "멀음");
    setOptionText("distanceState", "very_far", "매우 멀음");
    setOptionText("attackRangeState", "close", "근거리");
    setOptionText("attackRangeState", "far", "원거리");
    setOptionText("attackType", "physical", "물리");
    setOptionText("attackType", "plasma", "플라즈마");
    setOptionText("attackType", "item", "아이템");
    setOptionText("plasmaSkillRange", "close", "근거리 집중");
    setOptionText("plasmaSkillRange", "far", "원거리 집중");
    setOptionText("shape", "single", "단일");
    setOptionText("shape", "spread", "확산");
    setOptionText("shape", "place", "설치");
    setOptionText("shape", "stabilize", "안정화");
    setOptionText("intensity", "high", "상");
    setOptionText("intensity", "mid", "중");
    setOptionText("intensity", "low", "하");
  }

  function onWindowScroll(){
    if(headerScrollTicking) return;
    headerScrollTicking = true;
    requestAnimationFrame(updateHeaderVisibilityByScroll);
  }

  function getRole(){
    return $("roleMode").value === "admin" ? "admin" : "user";
  }

  function isAdminRole(){
    return getRole() === "admin";
  }

  function ensureAdminRoleSelectionAllowed(showAlert = true){
    const roleSelect = $("roleMode");
    if(!roleSelect) return true;
    if(roleSelect.value !== "admin") return true;
    if(adminSessionUnlocked) return true;
    roleSelect.value = "user";
    if(showAlert){
      alert("관리자 전환은 [관리자용 <-] 버튼에서 비밀번호 확인 후 가능합니다.");
    }
    return false;
  }

  function requestAdminSessionUnlock(){
    const roleSelect = $("roleMode");
    if(!roleSelect) return;
    const entered = window.prompt("관리자 비밀번호를 입력하세요.");
    if(entered === null) return;
    if(String(entered) !== ADMIN_SESSION_PASSWORD){
      alert("비밀번호가 올바르지 않습니다.");
      roleSelect.value = "user";
      setRoleUiState();
      render({ skipSync: true });
      return;
    }
    adminSessionUnlocked = true;
    saveAdminSessionCache();
    roleSelect.value = "admin";
    setRoleUiState();
    render({ skipSync: false });
  }

  function getUserSlot(){
    return clamp(toInt($("userSlot").value), 0, MAX_PLAYERS - 1);
  }

  function getAdminTargetSlot(){
    return clamp(toInt($("adminTargetSlot").value), 0, MAX_PLAYERS - 1);
  }

  function getAdminInspectSlot(){
    return clamp(toInt($("adminInspectSlot").value), 0, MAX_PLAYERS - 1);
  }

  function getAdminStatBounds(statKey, pc){
    if(statKey === "pool") return { min: 1, max: 99999 };
    if(statKey === "plasmaNow") return { min: 0, max: clamp(toInt((pc && pc.plasmaMax) || getPlasmaMaxFromPoolStat(pc && pc.pool, state.k)), 1, 99999) };
    if(statKey === "plasmaCap"){
      const cap = getEffectivePlasmaCap(pc || {}, getStatStep(state.k));
      return { min: cap, max: cap };
    }
    if(statKey === "alwaysHit") return { min: -99, max: 99 };
    if(statKey === "alwaysPow") return { min: -99, max: 99 };
    return { min: 0, max: 99999 };
  }

  function isPlasmaType(type){
    return normalizeAttackType(type) === "plasma";
  }

  function syncAdminStatEditor(){
    const slot = getAdminTargetSlot();
    const statKey = $("adminStatName").value;
    if(!ADMIN_STAT_KEYS.includes(statKey)){
      $("adminStatName").value = ADMIN_STAT_KEYS[0];
    }
    const nextStatKey = $("adminStatName").value;
    const pc = state.pcs[slot] || defaultPC(slot);
    const bounds = getAdminStatBounds(nextStatKey, pc);
    $("adminStatValue").min = String(bounds.min);
    $("adminStatValue").max = String(bounds.max);
    $("adminStatValue").value = clamp(toInt(pc[nextStatKey]), bounds.min, bounds.max);
  }

  function ensurePartyFollowers(){
    if(!Array.isArray(state.partyFollowers)) state.partyFollowers = [];
    state.partyFollowers = state.partyFollowers
      .map((npc, idx) => normalizeFollowerNpc(npc, idx))
      .slice(0, MAX_PARTY_FOLLOWERS);
    return state.partyFollowers;
  }

  function ensurePc(slot){
    const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    state.pcs[idx] = Object.assign(defaultPC(idx), state.pcs[idx] || {});
    const pc = state.pcs[idx];
    pc.pool = clamp(toInt(pc.pool || pc.plasmaMax || 5), 1, 99999);
    pc.plasmaMax = getPlasmaMaxFromPoolStat(pc.pool, state.k);
    pc.plasmaNow = clamp(toInt(pc.plasmaNow), 0, pc.plasmaMax);
    pc.plasmaCap = getEffectivePlasmaCap(pc, getStatStep(state.k));
    pc.multi = clamp(toInt(pc.multi || 1), 1, getEffectivePlasmaCap(pc, getStatStep(state.k)));
    pc.alwaysHit = clamp(toInt(pc.alwaysHit), -99, 99);
    pc.alwaysPow = clamp(toInt(pc.alwaysPow), -99, 99);
    pc.distance = DISTANCE_KEYS.includes(String(pc.distance || "")) ? String(pc.distance) : "close";
    pc.plasmaRangeKind = (String(pc.plasmaRangeKind || "") === "far") ? "far" : "close";
    pc.skillPoints = clamp(toInt(pc.skillPoints), 0, 99999);
    pc.gold = clamp(toInt(pc.gold), 0, 999999999);
    pc.hp = clamp(toInt(pc.hp), 0, 99999);
    pc.hpNow = clamp(toInt(pc.hpNow ?? pc.hp), 0, pc.hp);
    pc.str = clamp(toInt(pc.str), 0, 99999);
    pc.dex = clamp(toInt(pc.dex), 0, 99999);
    pc.int = clamp(toInt(pc.int), 0, 99999);
    pc.plasmaPower = clamp(toInt(pc.plasmaPower), 0, 99999);
    pc.cha = clamp(toInt(pc.cha), 0, 99999);
    pc.avatar = sanitizeAvatarDataUrl(pc.avatar || "");
    pc.statusEffects = sanitizeStatusEffects(pc.statusEffects);
    pc.hunger = clamp(toInt(pc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
    pc.injuryMap = sanitizeInjuryMap(pc.injuryMap || pc.injuries || pc.bodyInjury || {});
    if(!Array.isArray(pc.followers)) pc.followers = [];
    pc.followers = pc.followers.map((npc, npcIdx) => normalizeFollowerNpc(npc, npcIdx)).slice(0, MAX_FOLLOWERS_PER_PC);
    if(!Array.isArray(pc.inventory)) pc.inventory = [];
    pc.inventory = pc.inventory.map((item, itemIdx) => normalizeInventoryItem(item, itemIdx));
    if(!Array.isArray(pc.plasmaLayers)) pc.plasmaLayers = [];
    pc.plasmaLayers = pc.plasmaLayers.map((layer, layerIdx) => normalizePlasmaLayer(layer, layerIdx)).slice(-20);
    pc.plasmaSkillBook = normalizePlasmaSkillBook(pc.plasmaSkillBook);
    pc.plasmaSkillBookUpdatedAt = clamp(toInt(pc.plasmaSkillBookUpdatedAt), 0, SKILL_BOOK_TS_MAX);
    pc.activePlasmaSkillId = safeText(pc.activePlasmaSkillId || "", 60);
    if(pc.activePlasmaSkillId && !pc.plasmaSkillBook.some((entry) => entry.id === pc.activePlasmaSkillId)){
      pc.activePlasmaSkillId = "";
    }
    return pc;
  }

  function getStatusMeta(key){
    return STATUS_EFFECT_BY_KEY.get(String(key || "")) || null;
  }

  function hasStatusEffect(statusEffects, statusKey){
    const key = safeText(statusKey || "", 40);
    return sanitizeStatusEffects(statusEffects).includes(key);
  }

  function setStatusEffectOnPc(pc, statusKey, enabled){
    if(!pc || typeof pc !== "object") return;
    const key = safeText(statusKey || "", 40);
    if(!STATUS_EFFECT_KEY_SET.has(key)) return;
    const current = sanitizeStatusEffects(pc.statusEffects);
    if(enabled){
      if(!current.includes(key)) current.push(key);
      pc.statusEffects = sanitizeStatusEffects(current);
      return;
    }
    pc.statusEffects = current.filter((item) => item !== key);
  }

  function renderStatusBadgesInto(container, statusEffects, maxVisible = STATUS_EFFECTS.length, options = {}){
    if(!container) return;
    const list = sanitizeStatusEffects(statusEffects);
    if(list.length === 0){
      container.innerHTML = '<span class="statusEmpty">상태이상 없음</span>';
      return;
    }
    container.innerHTML = "";
    const visible = list.slice(0, Math.max(1, toInt(maxVisible)));
    for(const key of visible){
      const meta = getStatusMeta(key);
      if(!meta) continue;
      const chip = document.createElement("span");
      chip.className = `statusChip status-${key}`;
      chip.title = meta.label;
      chip.textContent = meta.label;
      container.appendChild(chip);
    }
    if(list.length > visible.length && !options.hideOverflowChip){
      const more = document.createElement("span");
      more.className = "statusChip statusMore";
      more.textContent = `+${list.length - visible.length}`;
      container.appendChild(more);
    }
  }

  function toggleStatusEffectByAdmin(slot, statusKey){
    if(!isAdminRole()) return;
    const key = safeText(statusKey || "", 40);
    if(!STATUS_EFFECT_KEY_SET.has(key)) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    const current = sanitizeStatusEffects(pc.statusEffects);
    if(current.includes(key)){
      pc.statusEffects = current.filter((item) => item !== key);
      if(key === "focus"){
        // GM clears 집중 상태 -> 즉시 행동 가능
        pc.skipTurns = 0;
      }
    }else{
      current.push(key);
      pc.statusEffects = sanitizeStatusEffects(current);
      if(key === "focus"){
        pc.skipTurns = Math.max(1, clamp(toInt(pc.skipTurns), 0, 99));
      }
    }
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function clearStatusEffectsByAdmin(slot){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.statusEffects = [];
    pc.skipTurns = 0;
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function toggleStatusEffectOnMonsterByAdmin(monsterId, statusKey){
    if(!isAdminRole()) return;
    const key = safeText(statusKey || "", 40);
    if(!STATUS_EFFECT_KEY_SET.has(key)) return;
    mutateActiveMonster(monsterId, (draft) => {
      const current = sanitizeStatusEffects(draft.statusEffects);
      if(current.includes(key)){
        draft.statusEffects = current.filter((item) => item !== key);
      }else{
        current.push(key);
        draft.statusEffects = sanitizeStatusEffects(current);
      }
    });
  }

  function clearMonsterStatusEffectsByAdmin(monsterId){
    if(!isAdminRole()) return;
    mutateActiveMonster(monsterId, (draft) => {
      draft.statusEffects = [];
    });
  }

  function renderAdminStatusEditor(slot){
    const wrap = $("adminStatusGrid");
    if(!wrap) return;
    const pc = ensurePc(slot);
    const current = sanitizeStatusEffects(pc.statusEffects);
    wrap.innerHTML = "";
    for(const status of STATUS_EFFECTS){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `statusToggleBtn status-${status.key}${current.includes(status.key) ? " active" : ""}`;
      btn.textContent = status.label;
      btn.addEventListener("click", () => toggleStatusEffectByAdmin(slot, status.key));
      wrap.appendChild(btn);
    }
  }

  function renderUserStatusBadges(){
    const pc = ensurePc(state.activePc);
    renderStatusBadgesInto($("userStatusBadges"), pc.statusEffects, STATUS_EFFECTS.length);
  }

  function renderPlayerCardStatusEditor(slot, statusWrap){
    if(!statusWrap) return;
    const oldEditor = statusWrap.querySelector(".playerStatusEditorInline");
    if(oldEditor) oldEditor.remove();
    if(!isAdminRole()) return;
    if(!statusWrap.dataset.stopPropBound){
      statusWrap.addEventListener("click", (ev) => ev.stopPropagation());
      statusWrap.dataset.stopPropBound = "1";
    }

    const pc = ensurePc(slot);
    const current = sanitizeStatusEffects(pc.statusEffects);
    const expanded = expandedPlayerStatusEditorSlots.has(slot);

    const editor = document.createElement("div");
    editor.className = "playerStatusEditorInline";
    const controls = document.createElement("div");
    controls.className = "playerStatusAdminControls";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "statusExpandBtn statusInlineToggleBtn";
    toggleBtn.textContent = expanded ? "상태이상 닫기" : "상태이상 펼치기";
    toggleBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if(expandedPlayerStatusEditorSlots.has(slot)) expandedPlayerStatusEditorSlots.delete(slot);
      else expandedPlayerStatusEditorSlots.add(slot);
      renderPlayerCards();
    });
    controls.appendChild(toggleBtn);

    if(current.length > 0){
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "statusExpandBtn statusInlineClearBtn";
      clearBtn.textContent = "전체 해제";
      clearBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        clearStatusEffectsByAdmin(slot);
      });
      controls.appendChild(clearBtn);
    }

    editor.appendChild(controls);
    if(!expanded){
      statusWrap.appendChild(editor);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "statusGrid playerStatusInlineGrid";
    for(const status of STATUS_EFFECTS){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `statusToggleBtn status-${status.key}${current.includes(status.key) ? " active" : ""}`;
      btn.textContent = status.label;
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        toggleStatusEffectByAdmin(slot, status.key);
      });
      grid.appendChild(btn);
    }
    editor.appendChild(grid);
    statusWrap.appendChild(editor);
  }

  function findTemplate(templateId){
    return state.itemTemplates.find((tpl) => tpl.id === templateId) || null;
  }

  function findNpcTemplate(templateId){
    return state.npcTemplates.find((tpl) => tpl.id === templateId) || null;
  }

  function findMonsterTemplate(monsterId){
    return state.monsterTemplates.find((monster) => monster.id === monsterId) || null;
  }

  function ensureActiveMonsters(){
    if(!Array.isArray(state.activeMonsters)) state.activeMonsters = [];
    state.activeMonsters = state.activeMonsters.map((monster, index) => normalizeActiveMonster(monster, index));
    return state.activeMonsters;
  }

  function ensurePublishedActiveMonsters(){
    if(!Array.isArray(state.publishedActiveMonsters)) state.publishedActiveMonsters = [];
    state.publishedActiveMonsters = state.publishedActiveMonsters.map((monster, index) => normalizeActiveMonster(monster, index));
    return state.publishedActiveMonsters;
  }

  function findActiveMonster(monsterId){
    if(!monsterId) return null;
    const id = safeText(monsterId, 60);
    return ensureActiveMonsters().find((monster) => monster.id === id) || null;
  }

  function findEncounterMonster(monsterId){
    return findActiveMonster(monsterId) || findMonsterTemplate(monsterId);
  }

  function findPublishedEncounterMonster(monsterId){
    if(!monsterId) return null;
    const id = safeText(monsterId, 60);
    return ensurePublishedActiveMonsters().find((monster) => monster.id === id) || findMonsterTemplate(id);
  }

  function getAlphabetPrefix(index){
    let n = Math.max(0, toInt(index));
    let out = "";
    do{
      out = String.fromCharCode(65 + (n % 26)) + out;
      n = Math.floor(n / 26) - 1;
    }while(n >= 0);
    return out;
  }

  function buildMonsterDuplicateNameMap(monsterList){
    const list = Array.isArray(monsterList) ? monsterList : [];
    const buckets = new Map();
    for(const monster of list){
      if(!monster || typeof monster !== "object") continue;
      const id = safeText(monster.id || "", 60);
      if(!id) continue;
      const baseName = safeText(monster.name || "몬스터", 80) || "몬스터";
      if(!buckets.has(baseName)){
        buckets.set(baseName, []);
      }
      buckets.get(baseName).push({ id, baseName });
    }
    const nameMap = new Map();
    for(const [baseName, entries] of buckets.entries()){
      if(entries.length <= 1){
        nameMap.set(entries[0].id, baseName);
        continue;
      }
      for(let idx = 0; idx < entries.length; idx += 1){
        nameMap.set(entries[idx].id, `${getAlphabetPrefix(idx)}${baseName}`);
      }
    }
    return nameMap;
  }

  function getMonsterDisplayNameFromMap(monster, nameMap){
    const raw = monster && typeof monster === "object" ? monster : {};
    const baseName = safeText(raw.name || "몬스터", 80) || "몬스터";
    const id = safeText(raw.id || "", 60);
    if(!id || !(nameMap instanceof Map)) return baseName;
    return safeText(nameMap.get(id) || baseName, 80) || baseName;
  }

  function getMonsterDisplayNameById(monsterId, options = {}){
    const id = safeText(monsterId || "", 60);
    if(!id) return "";
    const usePublished = !!(options && options.usePublished);
    const list = usePublished ? ensurePublishedActiveMonsters() : ensureActiveMonsters();
    const monster = list.find((entry) => safeText(entry && entry.id ? entry.id : "", 60) === id);
    if(!monster) return "";
    const nameMap = buildMonsterDuplicateNameMap(list);
    return getMonsterDisplayNameFromMap(monster, nameMap);
  }

  function getPcSelectedMonsterId(slot){
    const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    const pc = ensurePc(idx);
    return safeText(pc.targetMonsterId || "", 60);
  }

  function formatSignedNumber(value){
    const amount = toInt(value);
    return `${amount >= 0 ? "+" : ""}${amount}`;
  }

  function formatDcWithBonus(dc, dcBonus){
    const baseDc = clamp(toInt(dc), 1, 99999);
    const bonus = clamp(toInt(dcBonus), -999, 999);
    return bonus === 0 ? String(baseDc) : `${baseDc}${bonus >= 0 ? "+" : ""}${bonus}`;
  }

  function getTargetValue(targetInfo){
    const info = targetInfo && typeof targetInfo === "object" ? targetInfo : {};
    const baseDc = clamp(toInt(info.dc), 1, 99999);
    const dcBonus = clamp(toInt(info.dcBonus), -999, 999);
    const eva = clamp(toInt(info.eva), -999, 999);
    return baseDc + dcBonus + eva;
  }

  function getEncounterMonsterIdForPc(slot, options = {}){
    const usePublished = !!(options && options.usePublished);
    const encounter = normalizeEncounterConfig(usePublished ? state.publishedEncounter : state.encounter);
    const mode = encounter.mode;
    if(mode === "per_player"){
      return safeText(encounter.perPlayerMonsterIds[clamp(toInt(slot), 0, MAX_PLAYERS - 1)] || "", 60);
    }
    const sharedMonsterId = safeText(encounter.sharedMonsterId || "", 60);
    if(sharedMonsterId === ENCOUNTER_SHARED_PLAYER_SELECTED_ID){
      return getPcSelectedMonsterId(slot);
    }
    return sharedMonsterId;
  }

  function getTargetInfoForPc(slot){
    const usePublished = !isAdminRole();
    const encounter = normalizeEncounterConfig(usePublished ? state.publishedEncounter : state.encounter);
    const mode = encounter.mode;
    const modeLabel = ENCOUNTER_MODE_LABEL[mode] || ENCOUNTER_MODE_LABEL.single;
    const monsterId = getEncounterMonsterIdForPc(slot, { usePublished });
    const monster = monsterId
      ? (usePublished ? findPublishedEncounterMonster(monsterId) : findEncounterMonster(monsterId))
      : null;

    if(monster){
      const runtimeDisplayName = monsterId
        ? (usePublished
          ? getMonsterDisplayNameById(monsterId, { usePublished: true })
          : getMonsterDisplayNameById(monsterId))
        : "";
      const baseMonsterLabel = runtimeDisplayName || safeText(monster.name || "몬스터", 80) || "몬스터";
      let label = baseMonsterLabel;
      if(mode === "swarm"){
        label = `${baseMonsterLabel} 무리 x${clamp(toInt(encounter.swarmCount || 1), 1, 999)}`;
      }
      const notes = [];
      const baseNote = ("statusMemo" in monster) ? monster.statusMemo : monster.note;
      if(baseNote) notes.push(baseNote);
      const dcBonus = clamp(toInt(monster.dcBonus), -99, 99);
      if(dcBonus !== 0){
        notes.push(`DC보너스 ${formatSignedNumber(dcBonus)}`);
      }
      if("extraDamage" in monster && toInt(monster.extraDamage) !== 0){
        const extraDamage = toInt(monster.extraDamage);
        notes.push(`추가데미지 ${extraDamage >= 0 ? "+" : ""}${extraDamage}`);
      }
      return {
        name: label,
        dc: clamp(toInt(monster.dc), 1, 99999),
        dcBonus,
        dcPublic: !!monster.dcPublic,
        eva: clamp(toInt(monster.eva), -999, 999),
        adjustLabel: "회피",
        mode,
        modeLabel,
        source: "monster",
        note: safeText(notes.join(" | "), 120)
      };
    }

    return {
      name: "수동 대상",
      dc: clamp(toInt(state.dc), 1, 99999),
      dcBonus: 0,
      dcPublic: true,
      eva: clamp(toInt(state.enemyEva), -999, 999),
      adjustLabel: "DC 보정",
      mode,
      modeLabel,
      source: "manual",
      note: "기본 DC/DC 보정 사용"
    };
  }

  function createItemTemplate(){
    if(!isAdminRole()) return;
    const name = safeText($("adminItemName").value, 40);
    if(!name){
      alert("템플릿 이름을 입력해주세요.");
      return;
    }
    const baseQty = clamp(toInt($("adminItemBaseQty").value), 1, 9999);
    const type = ITEM_TYPES.includes($("adminItemType").value) ? $("adminItemType").value : "item";
    const desc = safeItemDesc($("adminItemDesc").value, 500);
    const editingId = safeText(editingItemTemplateId || "", 60);
    if(editingId){
      const idx = state.itemTemplates.findIndex((tpl) => tpl.id === editingId);
      if(idx >= 0){
        const next = normalizeItemTemplate({
          id: editingId,
          name,
          type,
          desc,
          baseQty
        });
        state.itemTemplates[idx] = next;
      }else{
        state.itemTemplates.push(normalizeItemTemplate({
          id: editingId,
          name,
          type,
          desc,
          baseQty
        }));
      }
    }else{
      state.itemTemplates.push(normalizeItemTemplate({
        id: makeId("tpl"),
        name,
        type,
        desc,
        baseQty
      }));
    }
    clearItemTemplateEditor();
    render();
    saveLocal();
  }

  function removeItemTemplate(templateId){
    if(!isAdminRole()) return;
    const id = safeText(templateId, 60);
    const before = state.itemTemplates.length;
    state.itemTemplates = state.itemTemplates.filter((tpl) => tpl.id !== id);
    if(before === state.itemTemplates.length) return;
    if(id && safeText(editingItemTemplateId || "", 60) === id){
      clearItemTemplateEditor();
    }
    render();
    saveLocal();
  }

  function syncItemTemplateEditorUi(){
    const createBtn = $("adminCreateItemBtn");
    const cancelBtn = $("adminCancelItemEditBtn");
    const editing = !!safeText(editingItemTemplateId || "", 60);
    if(createBtn) createBtn.textContent = editing ? "템플릿 수정 저장" : "템플릿 생성";
    if(cancelBtn) cancelBtn.style.display = editing ? "" : "none";
  }

  function clearItemTemplateEditor(){
    editingItemTemplateId = "";
    $("adminItemName").value = "";
    $("adminItemType").value = "consumable";
    $("adminItemBaseQty").value = "1";
    $("adminItemDesc").value = "";
    syncItemTemplateEditorUi();
  }

  function beginEditItemTemplate(templateId){
    if(!isAdminRole()) return;
    const id = safeText(templateId, 60);
    const template = findTemplate(id);
    if(!template) return;
    editingItemTemplateId = template.id;
    $("adminItemName").value = template.name;
    $("adminItemType").value = ITEM_TYPES.includes(template.type) ? template.type : "item";
    $("adminItemBaseQty").value = String(clamp(toInt(template.baseQty), 1, 9999));
    $("adminItemDesc").value = safeItemDesc(template.desc || "", 500);
    syncItemTemplateEditorUi();
  }

  function ensureAdminNpcDcField(){
    const existing = $("adminNpcDc");
    if(existing) return existing;
    const powInput = $("adminNpcPowBonus");
    if(!powInput || !powInput.parentElement) return null;
    const fieldWrap = document.createElement("div");
    const label = document.createElement("label");
    label.setAttribute("for", "adminNpcDc");
    label.textContent = "DC";
    const input = document.createElement("input");
    input.id = "adminNpcDc";
    input.type = "number";
    input.min = "1";
    input.max = "99999";
    input.value = String(PLAYER_BASE_DC);
    fieldWrap.appendChild(label);
    fieldWrap.appendChild(input);
    const powWrap = powInput.parentElement;
    const parent = powWrap.parentElement;
    if(parent){
      if(powWrap.nextSibling) parent.insertBefore(fieldWrap, powWrap.nextSibling);
      else parent.appendChild(fieldWrap);
    }
    return input;
  }

  function buildFollowerNpcFromAdminForm(){
    ensureAdminNpcDcField();
    const name = safeText($("adminNpcName").value, 40);
    const hp = clamp(toInt($("adminNpcHp").value), 1, 99999);
    const plasma = clamp(toInt($("adminNpcPlasma").value), 1, 99999);
    const hunger = clamp(toInt($("adminNpcHunger").value), 0, HUNGER_MAX);
    const dcInput = $("adminNpcDc");
    const dc = clamp(toInt(dcInput ? dcInput.value : PLAYER_BASE_DC), 1, 99999);
    const hitBonus = clamp(toInt($("adminNpcHitBonus").value), -99, 99);
    const powBonus = clamp(toInt($("adminNpcPowBonus").value), -99, 99);
    const note = safeText($("adminNpcNote").value, 120);
    return normalizeFollowerNpc({
      id: makeId("npc"),
      name,
      image: pendingFollowerNpcImageDataUrl,
      hpNow: hp,
      hpMax: hp,
      plasmaNow: plasma,
      plasmaMax: plasma,
      plasmaCap: Math.min(2, plasma),
      hunger,
      dc,
      hitBonus,
      powBonus,
      note,
      statusEffects: [],
      injuryMap: createEmptyInjuryMap()
    });
  }

  function applyNpcTemplateToAdminForm(template){
    const next = normalizeFollowerTemplate(template || {});
    ensureAdminNpcDcField();
    $("adminNpcName").value = next.name;
    $("adminNpcHp").value = String(next.hpMax);
    $("adminNpcPlasma").value = String(next.plasmaMax);
    $("adminNpcHunger").value = String(clamp(toInt(next.hunger ?? HUNGER_MAX), 0, HUNGER_MAX));
    const adminNpcDc = $("adminNpcDc");
    if(adminNpcDc) adminNpcDc.value = String(clamp(toInt(next.dc ?? PLAYER_BASE_DC), 1, 99999));
    $("adminNpcHitBonus").value = String(clamp(toInt(next.hitBonus || 0), -99, 99));
    $("adminNpcPowBonus").value = String(clamp(toInt(next.powBonus || 0), -99, 99));
    $("adminNpcNote").value = next.note || "";
    pendingFollowerNpcImageDataUrl = sanitizeFollowerImageDataUrl(next.image || "");
    updatePendingFollowerNpcImagePreview();
  }

  function saveNpcTemplateFromAdminForm(){
    if(!isAdminRole()) return;
    const draft = buildFollowerNpcFromAdminForm();
    if(!draft.name){
      alert("NPC 이름을 입력해주세요.");
      return;
    }
    if(!Array.isArray(state.npcTemplates)) state.npcTemplates = [];
    const template = normalizeFollowerTemplate({
      id: makeId("npctpl"),
      name: draft.name,
      image: draft.image,
      hpNow: draft.hpNow,
      hpMax: draft.hpMax,
      plasmaNow: draft.plasmaNow,
      plasmaMax: draft.plasmaMax,
      plasmaCap: draft.plasmaCap,
      hunger: draft.hunger,
      dc: draft.dc,
      hitBonus: draft.hitBonus,
      powBonus: draft.powBonus,
      note: draft.note,
      statusEffects: draft.statusEffects,
      injuryMap: draft.injuryMap
    }, state.npcTemplates.length);
    state.npcTemplates.push(template);
    render();
    const select = $("adminNpcTemplateSelect");
    if(select) select.value = template.id;
    saveLocal();
  }

  function applySelectedNpcTemplateToForm(){
    if(!isAdminRole()) return;
    const select = $("adminNpcTemplateSelect");
    if(!select) return;
    const templateId = safeText(select.value || "", 60);
    if(!templateId) return;
    const template = findNpcTemplate(templateId);
    if(!template) return;
    applyNpcTemplateToAdminForm(template);
  }

  function removeSelectedNpcTemplate(){
    if(!isAdminRole()) return;
    const select = $("adminNpcTemplateSelect");
    if(!select) return;
    const templateId = safeText(select.value || "", 60);
    if(!templateId) return;
    const before = Array.isArray(state.npcTemplates) ? state.npcTemplates.length : 0;
    state.npcTemplates = (Array.isArray(state.npcTemplates) ? state.npcTemplates : [])
      .filter((tpl) => tpl.id !== templateId);
    if(before === state.npcTemplates.length) return;
    render();
    saveLocal();
  }

  function saveFollowerNpcAsTemplate(npcId){
    if(!isAdminRole()) return;
    const source = ensurePartyFollowers()
      .find((npc) => npc.id === safeText(npcId, 60));
    if(!source) return;
    if(!Array.isArray(state.npcTemplates)) state.npcTemplates = [];
    state.npcTemplates.push(normalizeFollowerTemplate({
      id: makeId("npctpl"),
      name: source.name,
      image: source.image,
      hpNow: source.hpNow,
      hpMax: source.hpMax,
      plasmaNow: source.plasmaNow,
      plasmaMax: source.plasmaMax,
      plasmaCap: source.plasmaCap,
      hunger: source.hunger,
      dc: source.dc,
      hitBonus: source.hitBonus,
      powBonus: source.powBonus,
      note: source.note,
      statusEffects: source.statusEffects,
      injuryMap: source.injuryMap
    }, state.npcTemplates.length));
    render();
    saveLocal();
  }

  function updateMonsterTemplateImagePreview(){
    const preview = $("monsterImagePreview");
    if(!preview) return;
    preview.src = pendingMonsterTemplateImageDataUrl || makeMonsterPlaceholder("M");
  }

  function clearMonsterTemplatePendingImage(options = {}){
    const markTouched = options && options.markTouched !== false;
    pendingMonsterTemplateImageDataUrl = "";
    if(markTouched) monsterTemplateImageTouched = true;
    const input = $("monsterImageFile");
    if(input) input.value = "";
    updateMonsterTemplateImagePreview();
  }

  function syncMonsterTemplateEditorUi(){
    const createBtn = $("monsterCreateBtn");
    const cancelBtn = $("monsterCancelEditBtn");
    const editing = !!safeText(editingMonsterTemplateId || "", 60);
    if(createBtn) createBtn.textContent = editing ? "몬스터 템플릿 수정 저장" : "몬스터 템플릿 저장";
    if(cancelBtn) cancelBtn.style.display = editing ? "" : "none";
  }

  function ensureMonsterTemplateDamageDiceControl(){
    const existing = $("monsterDamageDiceSides");
    if(existing) return existing;
    const dcInput = $("monsterDc");
    if(!dcInput || !dcInput.parentElement) return null;
    const fieldWrap = document.createElement("div");
    fieldWrap.id = "monsterDamageDiceField";
    const label = document.createElement("label");
    label.setAttribute("for", "monsterDamageDiceSides");
    label.textContent = "기본 피해 주사위";
    const select = document.createElement("select");
    select.id = "monsterDamageDiceSides";
    const sidesOptions = [4, 6, 8, 10, 12, 20];
    for(const sides of sidesOptions){
      const option = document.createElement("option");
      option.value = String(sides);
      option.textContent = getDamageDiceLabel(sides);
      select.appendChild(option);
    }
    select.value = "6";
    fieldWrap.appendChild(label);
    fieldWrap.appendChild(select);
    const dcWrap = dcInput.parentElement;
    const parent = dcWrap.parentElement;
    if(parent){
      if(dcWrap.nextSibling) parent.insertBefore(fieldWrap, dcWrap.nextSibling);
      else parent.appendChild(fieldWrap);
    }
    return select;
  }

  function clearMonsterTemplateEditor(){
    ensureMonsterTemplateDamageDiceControl();
    editingMonsterTemplateId = "";
    monsterTemplateImageTouched = false;
    monsterTemplateImageApplying = false;
    $("monsterName").value = "";
    $("monsterKind").value = "single";
    $("monsterHp").value = "20";
    $("monsterDc").value = "12";
    $("monsterEvaInput").value = "0";
    const monsterDcPublic = $("monsterDcPublic");
    if(monsterDcPublic) monsterDcPublic.value = "0";
    const monsterDcBonus = $("monsterDcBonus");
    if(monsterDcBonus) monsterDcBonus.value = "0";
    const monsterAttackHitBonus = $("monsterAttackHitBonus");
    if(monsterAttackHitBonus) monsterAttackHitBonus.value = "0";
    const monsterExtraDamage = $("monsterExtraDamage");
    if(monsterExtraDamage) monsterExtraDamage.value = "0";
    const monsterDamageDiceSides = $("monsterDamageDiceSides");
    if(monsterDamageDiceSides) monsterDamageDiceSides.value = "6";
    $("monsterNote").value = "";
    clearMonsterTemplatePendingImage({ markTouched: false });
    syncMonsterTemplateEditorUi();
  }

  function beginEditMonsterTemplate(monsterId){
    if(!isAdminRole()) return;
    ensureMonsterTemplateDamageDiceControl();
    const id = safeText(monsterId, 60);
    const monster = findMonsterTemplate(id);
    if(!monster) return;
    editingMonsterTemplateId = monster.id;
    $("monsterName").value = monster.name;
    $("monsterKind").value = monster.kind === "swarm" ? "swarm" : "single";
    $("monsterHp").value = String(clamp(toInt(monster.hp), 1, 999999));
    $("monsterDc").value = String(clamp(toInt(monster.dc), 1, 99999));
    $("monsterEvaInput").value = String(clamp(toInt(monster.eva), -999, 999));
    const monsterDcPublic = $("monsterDcPublic");
    if(monsterDcPublic) monsterDcPublic.value = monster.dcPublic ? "1" : "0";
    const monsterDcBonus = $("monsterDcBonus");
    if(monsterDcBonus) monsterDcBonus.value = String(clamp(toInt(monster.dcBonus), -99, 99));
    const monsterAttackHitBonus = $("monsterAttackHitBonus");
    if(monsterAttackHitBonus) monsterAttackHitBonus.value = String(clamp(toInt(monster.attackHitBonus), -99, 99));
    const monsterExtraDamage = $("monsterExtraDamage");
    if(monsterExtraDamage) monsterExtraDamage.value = String(clamp(toInt(monster.extraDamage), -999, 999));
    const monsterDamageDiceSides = $("monsterDamageDiceSides");
    if(monsterDamageDiceSides){
      monsterDamageDiceSides.value = String(normalizeDamageDiceSides(monster.damageDiceSides, 6));
    }
    $("monsterNote").value = safeMemo(monster.note || "", 500);
    pendingMonsterTemplateImageDataUrl = sanitizeMonsterImageDataUrl(monster.image || "");
    monsterTemplateImageTouched = false;
    monsterTemplateImageApplying = false;
    updateMonsterTemplateImagePreview();
    syncMonsterTemplateEditorUi();
  }

  async function optimizeMonsterImageFileToDataUrl(file){
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("이미지 파일을 읽지 못했습니다."));
      };
      image.src = url;
    });

    const naturalW = clamp(toInt(img.naturalWidth || img.width), 1, 20000);
    const naturalH = clamp(toInt(img.naturalHeight || img.height), 1, 20000);
    const maxSide = 640;
    let ratio = Math.min(1, maxSide / Math.max(naturalW, naturalH));
    let width = Math.max(1, Math.round(naturalW * ratio));
    let height = Math.max(1, Math.round(naturalH * ratio));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(!ctx) throw new Error("브라우저 캔버스를 초기화하지 못했습니다.");

    let best = "";
    const qualitySteps = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38, 0.3];
    const mimeCandidates = ["image/webp", "image/jpeg"];

    for(let scalePass = 0; scalePass < 8; scalePass += 1){
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for(const mime of mimeCandidates){
        for(const quality of qualitySteps){
          const dataUrl = canvas.toDataURL(mime, quality);
          if(!best || dataUrl.length < best.length) best = dataUrl;
          if(dataUrl.length <= MAX_MONSTER_IMAGE_DATAURL_LEN){
            return dataUrl;
          }
        }
      }

      width = Math.max(80, Math.round(width * 0.78));
      height = Math.max(80, Math.round(height * 0.78));
    }

    if(best && best.length <= MAX_MONSTER_IMAGE_DATAURL_LEN){
      return best;
    }
    throw new Error("이미지가 너무 큽니다. 더 작은 파일을 사용해주세요.");
  }

  async function applyMonsterTemplateImageFromFile(){
    if(!isAdminRole()){
      alert("관리자만 몬스터 이미지를 설정할 수 있습니다.");
      return;
    }
    const input = $("monsterImageFile");
    if(!input) return;
    const file = input.files && input.files[0];
    if(!file){
      alert("적용할 이미지 파일을 먼저 선택해주세요.");
      return;
    }
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_MONSTER_IMAGE_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 8MB 이하 파일을 사용해주세요.");
      return;
    }
    monsterTemplateImageApplying = true;
    try{
      const optimized = await optimizeMonsterImageFileToDataUrl(file);
      pendingMonsterTemplateImageDataUrl = sanitizeMonsterImageDataUrl(optimized);
      monsterTemplateImageTouched = true;
      updateMonsterTemplateImagePreview();
      syncMonsterTemplateEditorUi();
      input.value = "";
    }catch(err){
      alert(err && err.message ? err.message : "이미지 적용에 실패했습니다.");
    }finally{
      monsterTemplateImageApplying = false;
    }
  }

  function createMonsterTemplate(){
    if(!isAdminRole()) return;
    ensureMonsterTemplateDamageDiceControl();
    if(monsterTemplateImageApplying){
      alert("이미지 적용 중입니다. 잠시 후 다시 저장해주세요.");
      return;
    }
    const name = safeText($("monsterName").value, 40);
    if(!name){
      alert("몬스터 이름을 입력해주세요.");
      return;
    }

    const editingId = safeText(editingMonsterTemplateId || "", 60);
    const existingTemplate = editingId ? findMonsterTemplate(editingId) : null;
    const resolvedImage = monsterTemplateImageTouched
      ? pendingMonsterTemplateImageDataUrl
      : sanitizeMonsterImageDataUrl(existingTemplate && existingTemplate.image ? existingTemplate.image : pendingMonsterTemplateImageDataUrl);
    const monsterDamageDiceSides = $("monsterDamageDiceSides");
    const monsterDcPublic = $("monsterDcPublic");
    const monsterDcBonus = $("monsterDcBonus");
    const monsterAttackHitBonus = $("monsterAttackHitBonus");
    const monsterExtraDamage = $("monsterExtraDamage");
    const monster = normalizeMonsterTemplate({
      id: editingId || makeId("mon"),
      name,
      image: resolvedImage,
      kind: $("monsterKind").value,
      hp: clamp(toInt($("monsterHp").value), 1, 999999),
      dc: clamp(toInt($("monsterDc").value), 1, 99999),
      eva: clamp(toInt($("monsterEvaInput").value), -999, 999),
      dcPublic: String(monsterDcPublic ? monsterDcPublic.value : "0") === "1",
      dcBonus: clamp(toInt(monsterDcBonus ? monsterDcBonus.value : 0), -99, 99),
      attackHitBonus: clamp(toInt(monsterAttackHitBonus ? monsterAttackHitBonus.value : 0), -99, 99),
      extraDamage: clamp(toInt(monsterExtraDamage ? monsterExtraDamage.value : 0), -999, 999),
      damageDiceSides: normalizeDamageDiceSides(monsterDamageDiceSides ? monsterDamageDiceSides.value : 6, 6),
      note: safeMemo($("monsterNote").value, 500)
    });

    if(editingId){
      const idx = state.monsterTemplates.findIndex((item) => item.id === editingId);
      if(idx >= 0) state.monsterTemplates[idx] = monster;
      else state.monsterTemplates.push(monster);
      state.activeMonsters = ensureActiveMonsters().map((active, index) => {
        if(active.templateId !== editingId) return normalizeActiveMonster(active, index);
        return normalizeActiveMonster(Object.assign({}, active, {
          name: monster.name,
          image: monster.image,
          dc: monster.dc,
          eva: monster.eva,
          dcPublic: monster.dcPublic,
          dcBonus: monster.dcBonus,
          attackHitBonus: monster.attackHitBonus,
          extraDamage: monster.extraDamage,
          damageDiceSides: monster.damageDiceSides
        }), index);
      });
    }else{
      state.monsterTemplates.push(monster);
    }
    clearMonsterTemplateEditor();
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function removeMonsterTemplate(monsterId){
    if(!isAdminRole()) return;
    const before = state.monsterTemplates.length;
    state.monsterTemplates = state.monsterTemplates.filter((monster) => monster.id !== monsterId);
    if(before === state.monsterTemplates.length) return;
    if(safeText(editingMonsterTemplateId || "", 60) === safeText(monsterId, 60)){
      clearMonsterTemplateEditor();
    }

    const encounter = Object.assign(defaultEncounter(), state.encounter || {});
    if(encounter.sharedMonsterId === monsterId) encounter.sharedMonsterId = "";
    encounter.perPlayerMonsterIds = (Array.isArray(encounter.perPlayerMonsterIds) ? encounter.perPlayerMonsterIds : [])
      .slice(0, MAX_PLAYERS)
      .map((id) => id === monsterId ? "" : id);
    while(encounter.perPlayerMonsterIds.length < MAX_PLAYERS) encounter.perPlayerMonsterIds.push("");
    state.encounter = encounter;
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function syncEncounterFromUi(){
    if(!isAdminRole()) return;
    const encounter = normalizeEncounterConfig(state.encounter || {});
    encounter.mode = ENCOUNTER_MODES.includes($("encounterMode").value) ? $("encounterMode").value : "single";
    encounter.sharedMonsterId = safeText($("encounterSharedMonster").value || "", 60);
    if(
      encounter.sharedMonsterId
      && encounter.sharedMonsterId !== ENCOUNTER_SHARED_PLAYER_SELECTED_ID
      && !findActiveMonster(encounter.sharedMonsterId)
    ){
      encounter.sharedMonsterId = "";
    }
    encounter.swarmCount = clamp(toInt($("encounterSwarmCount").value), 1, 999);
    encounter.perPlayerMonsterIds = [
      safeText($("encounterPcMonster0").value || "", 60),
      safeText($("encounterPcMonster1").value || "", 60),
      safeText($("encounterPcMonster2").value || "", 60)
    ];
    state.encounter = normalizeEncounterConfig(encounter);
  }

  function applyEncounterToUsers(){
    if(!isAdminRole()) return;
    syncEncounterFromUi();
    state.publishedEncounter = normalizeEncounterConfig(state.encounter || {});
    state.publishedActiveMonsters = ensureActiveMonsters().map((monster, index) => normalizeActiveMonster(monster, index));
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function hideEncounterFromUsers(){
    if(!isAdminRole()) return;
    state.publishedEncounter = defaultEncounter();
    state.publishedActiveMonsters = [];
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function renderMonsterControls(){
    const list = Array.isArray(state.monsterTemplates) ? state.monsterTemplates : [];
    const activeList = ensureActiveMonsters();
    const activeNameMap = buildMonsterDuplicateNameMap(activeList);
    const encounter = Object.assign(defaultEncounter(), state.encounter || {});
    const mode = ENCOUNTER_MODES.includes(encounter.mode) ? encounter.mode : "single";

    const fillSelect = (id, selected, options = {}) => {
      const select = $(id);
      if(!select) return;
      select.innerHTML = "";

      if(options.includePlayerSelected){
        const dynamicOption = document.createElement("option");
        dynamicOption.value = ENCOUNTER_SHARED_PLAYER_SELECTED_ID;
        dynamicOption.textContent = ENCOUNTER_SHARED_PLAYER_SELECTED_LABEL;
        select.appendChild(dynamicOption);
      }

      const manual = document.createElement("option");
      manual.value = "";
      manual.textContent = "수동 대상 (기본 DC/DC 보정)";
      select.appendChild(manual);

      for(const monster of activeList){
        const option = document.createElement("option");
        option.value = monster.id;
        const dcText = formatDcWithBonus(monster.dc, monster.dcBonus);
        const displayName = getMonsterDisplayNameFromMap(monster, activeNameMap);
        const dcOpenText = monster.dcPublic ? "공개" : "비공개";
        option.textContent = `[운영중] ${displayName} [HP ${monster.hpNow}/${monster.hpMax} | DC(${dcOpenText}) ${dcText} / 회피 ${monster.eva} / 피해 ${getDamageDiceLabel(monster.damageDiceSides)}]`;
        select.appendChild(option);
      }

      if(options.includeTemplates !== false){
        for(const monster of list){
          const option = document.createElement("option");
          option.value = monster.id;
          const dcOpenText = monster.dcPublic ? "공개" : "비공개";
          option.textContent = `[템플릿] ${monster.name} [DC(${dcOpenText}) ${formatDcWithBonus(monster.dc, monster.dcBonus)} / 회피 ${monster.eva} / 적중보정 ${formatSignedNumber(monster.attackHitBonus)} / 추가데미지 ${formatSignedNumber(monster.extraDamage)} / 피해 ${getDamageDiceLabel(monster.damageDiceSides)}]`;
          select.appendChild(option);
        }
      }

      const selectedValue = safeText(selected || "", 60);
      const hasSelected = selectedValue
        ? Array.from(select.options).some((option) => option.value === selectedValue)
        : true;
      select.value = hasSelected ? selectedValue : "";
    };

    fillSelect("encounterSharedMonster", safeText(encounter.sharedMonsterId || "", 60), {
      includePlayerSelected: true,
      includeTemplates: false
    });
    const ids = Array.isArray(encounter.perPlayerMonsterIds) ? encounter.perPlayerMonsterIds : [];
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      fillSelect(`encounterPcMonster${i}`, safeText(ids[i] || "", 60));
    }
    $("encounterMode").value = mode;
    $("encounterSwarmCount").value = clamp(toInt(encounter.swarmCount || 1), 1, 999);

    const sharedDisabled = mode === "per_player";
    $("encounterSharedMonster").disabled = sharedDisabled;
    $("encounterSwarmCount").disabled = mode !== "swarm";
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      $(`encounterPcMonster${i}`).disabled = mode !== "per_player";
    }

    const wrap = $("monsterTemplateList");
    if(list.length === 0){
      wrap.innerHTML = '<div class="muted">저장된 몬스터 템플릿이 없습니다.</div>';
      return;
    }

    wrap.innerHTML = "";
    for(const monster of list){
      const row = document.createElement("div");
      row.className = "listRow";

      const left = document.createElement("div");
      left.className = "listText";
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "8px";
      const imageEl = document.createElement("img");
      imageEl.className = "monsterThumb";
      imageEl.alt = `${monster.name} 이미지`;
      imageEl.src = getMonsterImageSrc(monster);
      imageEl.loading = "lazy";
      imageEl.decoding = "async";
      left.appendChild(imageEl);
      const textWrap = document.createElement("div");
      const kindLabel = monster.kind === "swarm" ? "무리" : "단일";
      const editingMark = safeText(editingMonsterTemplateId || "", 60) === safeText(monster.id, 60) ? " [수정중]" : "";
      const notePreview = monster.note ? safeText(String(monster.note).replace(/\s+/g, " "), 120) : "";
      const dcOpenText = monster.dcPublic ? "공개" : "비공개";
      textWrap.textContent = `[${kindLabel}] ${monster.name}${editingMark} | HP ${monster.hp} | DC(${dcOpenText}) ${formatDcWithBonus(monster.dc, monster.dcBonus)} | 회피 ${monster.eva} | 적중보정 ${formatSignedNumber(monster.attackHitBonus)} | 추가데미지 ${formatSignedNumber(monster.extraDamage)} | 피해 ${getDamageDiceLabel(monster.damageDiceSides)}${notePreview ? ` | ${notePreview}` : ""}`;
      left.appendChild(textWrap);

      const right = document.createElement("div");
      right.className = "listActions";
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "수정";
      editBtn.addEventListener("click", () => beginEditMonsterTemplate(monster.id));
      right.appendChild(editBtn);
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "삭제";
      delBtn.addEventListener("click", () => removeMonsterTemplate(monster.id));
      right.appendChild(delBtn);

      row.appendChild(left);
      row.appendChild(right);
      wrap.appendChild(row);
    }
  }

  function createActiveMonsterFromTemplate(){
    if(!isAdminRole()) return;
    const templateId = safeText($("activeMonsterTemplateSelect").value || "", 60);
    if(!templateId){
      alert("불러올 몬스터 템플릿을 선택해주세요.");
      return;
    }
    const template = findMonsterTemplate(templateId);
    if(!template){
      alert("템플릿을 찾을 수 없습니다.");
      return;
    }
    const created = normalizeActiveMonster({
      id: makeId("act"),
      templateId: template.id,
      name: template.name,
      image: template.image || "",
      hpNow: template.hp,
      hpMax: template.hp,
      dc: template.dc,
      eva: template.eva,
      statusMemo: template.note || "",
      damageDiceSides: normalizeDamageDiceSides(template.damageDiceSides, 6),
      statusEffects: [],
      targetPlayerSlot: MONSTER_TARGET_NONE,
      targetFollowerId: "",
      attackHitBonus: clamp(toInt(template.attackHitBonus), -99, 99),
      extraDamage: clamp(toInt(template.extraDamage), -999, 999),
      dcBonus: clamp(toInt(template.dcBonus), -99, 99),
      dcPublic: !!template.dcPublic
    });
    ensureActiveMonsters().push(created);
    const focusSelect = $("activeMonsterFocusSelect");
    if(focusSelect) focusSelect.value = ACTIVE_MONSTER_FOCUS_ALL;
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function createActiveMonsterManual(){
    if(!isAdminRole()) return;
    const nameInput = $("activeMonsterManualName");
    const hpInput = $("activeMonsterManualHp");
    const dcInput = $("activeMonsterManualDc");
    const evaInput = $("activeMonsterManualEva");
    const memoInput = $("activeMonsterManualMemo");
    if(!nameInput || !hpInput || !dcInput || !evaInput || !memoInput) return;
    const name = safeText(nameInput.value, 40);
    if(!name){
      alert("몬스터 이름을 입력해주세요.");
      return;
    }
    const hp = clamp(toInt(hpInput.value), 1, 999999);
    ensureActiveMonsters().push(normalizeActiveMonster({
      id: makeId("act"),
      templateId: "",
      name,
      image: "",
      hpNow: hp,
      hpMax: hp,
      dc: clamp(toInt(dcInput.value), 1, 99999),
      eva: clamp(toInt(evaInput.value), -999, 999),
      statusMemo: safeMemo(memoInput.value, 500),
      damageDiceSides: 6,
      statusEffects: [],
      targetPlayerSlot: MONSTER_TARGET_NONE,
      targetFollowerId: "",
      attackHitBonus: 0,
      extraDamage: 0,
      dcBonus: 0,
      dcPublic: false
    }));
    const focusSelect = $("activeMonsterFocusSelect");
    if(focusSelect) focusSelect.value = ACTIVE_MONSTER_FOCUS_ALL;
    nameInput.value = "";
    memoInput.value = "";
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function isSameMonsterPatchValue(a, b){
    if(a === b) return true;
    if((a && typeof a === "object") || (b && typeof b === "object")){
      try{
        return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
      }catch(_err){
        return false;
      }
    }
    return false;
  }

  function buildMonsterPatchChanges(beforeMonster, afterMonster){
    const before = beforeMonster && typeof beforeMonster === "object" ? beforeMonster : {};
    const after = afterMonster && typeof afterMonster === "object" ? afterMonster : {};
    const changes = {};
    for(const key of MONSTER_PATCH_ALLOWED_KEYS){
      if(isSameMonsterPatchValue(before[key], after[key])) continue;
      changes[key] = after[key];
    }
    return changes;
  }

  function emitAdminMonsterPatch(monsterId, changes){
    if(!isAdminRole()) return false;
    if(!socket || !socket.connected || awaitingRoomState) return false;
    const roomId = normalizeRoomId(getRoomId());
    if(!roomId || normalizeRoomId(joinedRoomId) !== roomId) return false;
    const id = safeText(monsterId, 60);
    if(!id) return false;
    const nextChanges = changes && typeof changes === "object" ? changes : {};
    if(Object.keys(nextChanges).length <= 0) return true;
    socket.emit("admin_update_monster", { roomId, monsterId: id, changes: nextChanges }, (resp) => {
      if(resp && resp.ok) return;
      // Fallback to full sync if patch sync failed.
      queueAdminSync(false, { force: true });
    });
    return true;
  }

  function mutateActiveMonster(monsterId, mutator){
    if(!isAdminRole()) return;
    const id = safeText(monsterId, 60);
    const list = ensureActiveMonsters();
    const index = list.findIndex((monster) => monster.id === id);
    if(index < 0) return;
    const current = normalizeActiveMonster(list[index], index);
    const draft = Object.assign({}, current);
    mutator(draft);
    const nextMonster = normalizeActiveMonster(draft, index);
    list[index] = nextMonster;
    // Keep published snapshot synced so users immediately see status/injury edits.
    const published = ensurePublishedActiveMonsters();
    const pubIndex = published.findIndex((monster) => monster.id === id);
    if(pubIndex >= 0){
      published[pubIndex] = normalizeActiveMonster(nextMonster, pubIndex);
    }
    const changes = buildMonsterPatchChanges(current, nextMonster);
    render();
    saveLocal();
    if(!emitAdminMonsterPatch(id, changes)){
      queueAdminSync(true);
    }
  }

  function removeActiveMonster(monsterId){
    if(!isAdminRole()) return;
    const id = safeText(monsterId, 60);
    expandedMonsterAdminCards.delete(id);
    if(safeText(selectedMonsterAttackId || "", 60) === id){
      selectedMonsterAttackId = "";
    }
    const before = ensureActiveMonsters().length;
    state.activeMonsters = ensureActiveMonsters().filter((monster) => monster.id !== id);
    if(before === state.activeMonsters.length) return;

    const encounter = Object.assign(defaultEncounter(), state.encounter || {});
    if(encounter.sharedMonsterId === id) encounter.sharedMonsterId = "";
    encounter.perPlayerMonsterIds = (Array.isArray(encounter.perPlayerMonsterIds) ? encounter.perPlayerMonsterIds : [])
      .slice(0, MAX_PLAYERS)
      .map((monsterRefId) => monsterRefId === id ? "" : monsterRefId);
    while(encounter.perPlayerMonsterIds.length < MAX_PLAYERS) encounter.perPlayerMonsterIds.push("");
    state.encounter = encounter;
    for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
      const pc = ensurePc(slot);
      if(safeText(pc.targetMonsterId || "", 60) === id){
        pc.targetMonsterId = "";
      }
    }
    render();
    saveLocal();
    queueAdminSync(true);
  }

  async function applyActiveMonsterImageFromFile(monsterId, file){
    if(!isAdminRole()) return;
    if(!file) return;
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_MONSTER_IMAGE_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 8MB 이하 파일을 사용해주세요.");
      return;
    }
    try{
      const optimized = await optimizeMonsterImageFileToDataUrl(file);
      mutateActiveMonster(monsterId, (draft) => {
        draft.image = sanitizeMonsterImageDataUrl(optimized);
      });
    }catch(err){
      alert(err && err.message ? err.message : "몬스터 이미지 적용에 실패했습니다.");
    }
  }

  function clearActiveMonsterImage(monsterId){
    if(!isAdminRole()) return;
    mutateActiveMonster(monsterId, (draft) => {
      draft.image = "";
    });
  }

  function renderMonsterOpsPanel(){
    const panel = $("monsterOpsPanel");
    const templateSelect = $("activeMonsterTemplateSelect");
    const focusSelect = $("activeMonsterFocusSelect");
    const listWrap = $("activeMonsterRuntimeList");
    if(!panel || !templateSelect || !listWrap) return;

    const admin = isAdminRole();
    const adminControls = $("monsterAdminControls");
    if(adminControls) adminControls.style.display = admin ? "" : "none";

    const templates = Array.isArray(state.monsterTemplates) ? state.monsterTemplates : [];
    const activeMonsters = ensureActiveMonsters();
    const publishedMonsters = ensurePublishedActiveMonsters();
    const activeNameMap = buildMonsterDuplicateNameMap(activeMonsters);
    const publishedNameMap = buildMonsterDuplicateNameMap(publishedMonsters);
    const publishedEncounter = normalizeEncounterConfig(state.publishedEncounter || {});
    const publishStatus = $("encounterPublishStatus");
    const targetStatus = $("playerMonsterTargetStatus");
    if(publishStatus){
      if(!admin){
        publishStatus.style.display = "none";
      }else{
        const hasPublishedTarget = !!publishedEncounter.sharedMonsterId
          || publishedEncounter.perPlayerMonsterIds.some((id) => !!safeText(id || "", 60));
        const hasPublishedData = hasPublishedTarget || publishedMonsters.length > 0;
        publishStatus.style.display = "";
        publishStatus.textContent = hasPublishedData
          ? `전투 적용됨 | 공개 몬스터 ${publishedMonsters.length}개`
          : "전투 미적용 | 준비 후 [전투 적용]을 눌러 공개하세요.";
      }
    }
    if(targetStatus){
      if(!admin){
        targetStatus.style.display = "none";
      }else{
        const lines = [];
        const isDynamicShared = (
          publishedEncounter.mode !== "per_player"
          && safeText(publishedEncounter.sharedMonsterId || "", 60) === ENCOUNTER_SHARED_PLAYER_SELECTED_ID
        );
        const sharedMonsterId = safeText(publishedEncounter.sharedMonsterId || "", 60);
        const sharedMonster = sharedMonsterId && sharedMonsterId !== ENCOUNTER_SHARED_PLAYER_SELECTED_ID
          ? (findPublishedEncounterMonster(sharedMonsterId) || findEncounterMonster(sharedMonsterId))
          : null;
        const sharedMonsterName = sharedMonster
          ? (
            getMonsterDisplayNameById(sharedMonsterId, { usePublished: true })
            || getMonsterDisplayNameById(sharedMonsterId)
            || safeText(sharedMonster.name || "몬스터", 80)
          )
          : "";
        lines.push(
          isDynamicShared
            ? "공통 대상: 플레이어 선택 대상(동적)"
            : `공통 대상: ${sharedMonster ? sharedMonsterName : (sharedMonsterId || "미사용")}`
        );
        for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
          const selectedId = getPcSelectedMonsterId(slot);
          const selectedMonster = selectedId
            ? (findPublishedEncounterMonster(selectedId) || findEncounterMonster(selectedId))
            : null;
          const selectedText = selectedMonster
            ? (
              getMonsterDisplayNameById(selectedId, { usePublished: true })
              || getMonsterDisplayNameById(selectedId)
              || safeText(selectedMonster.name || "몬스터", 80)
            )
            : (selectedId ? "알 수 없는 몬스터" : "미선택");
          lines.push(`PC${slot + 1} 선택 대상: ${selectedText}`);
        }
        const selectedAttackMonster = getAdminMonsterAttackSource();
        const selectedAttackName = selectedAttackMonster
          ? (getMonsterDisplayNameById(selectedAttackMonster.id) || safeText(selectedAttackMonster.name || "몬스터", 80))
          : "";
        lines.push(
          selectedAttackMonster
            ? `GM 몬스터 굴림 모드: ON (${selectedAttackName} -> ${getMonsterTargetLabel(selectedAttackMonster)})`
            : "GM 몬스터 굴림 모드: OFF"
        );
        targetStatus.style.display = "";
        targetStatus.textContent = lines.join(" | ");
      }
    }

    if(admin){
      const prevTemplate = safeText(templateSelect.value || "", 60);
      templateSelect.innerHTML = "";
      if(templates.length === 0){
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "등록된 템플릿 없음";
        templateSelect.appendChild(empty);
      }else{
        for(const template of templates){
          const option = document.createElement("option");
          option.value = template.id;
          const dcOpenText = template.dcPublic ? "공개" : "비공개";
          option.textContent = `${template.name} [HP ${template.hp} | DC(${dcOpenText}) ${formatDcWithBonus(template.dc, template.dcBonus)} | 회피 ${template.eva} | 적중보정 ${formatSignedNumber(template.attackHitBonus)} | 추가데미지 ${formatSignedNumber(template.extraDamage)} | 피해 ${getDamageDiceLabel(template.damageDiceSides)}]`;
          templateSelect.appendChild(option);
        }
        templateSelect.value = templates.some((template) => template.id === prevTemplate) ? prevTemplate : templates[0].id;
      }
      if(focusSelect){
        const prevFocus = safeText(focusSelect.value || "", 60);
        focusSelect.innerHTML = "";
        const all = document.createElement("option");
        all.value = ACTIVE_MONSTER_FOCUS_ALL;
        all.textContent = `전체 (${activeMonsters.length}개 동시 관리)`;
        focusSelect.appendChild(all);
        if(activeMonsters.length === 0){
          const none = document.createElement("option");
          none.value = "";
          none.textContent = "운영 중 몬스터 없음";
          focusSelect.appendChild(none);
        }else{
          for(const monster of activeMonsters){
            const option = document.createElement("option");
            option.value = monster.id;
            const displayName = getMonsterDisplayNameFromMap(monster, activeNameMap);
            option.textContent = `${displayName} [HP ${monster.hpNow}/${monster.hpMax}]`;
            focusSelect.appendChild(option);
          }
          focusSelect.value = (prevFocus === ACTIVE_MONSTER_FOCUS_ALL || activeMonsters.some((monster) => monster.id === prevFocus))
            ? prevFocus
            : ACTIVE_MONSTER_FOCUS_ALL;
        }
      }
    }else{
      templateSelect.innerHTML = "";
      if(focusSelect) focusSelect.innerHTML = "";
    }

    let visibleMonsters = activeMonsters;
    if(admin){
      const focusedId = safeText((focusSelect && focusSelect.value) || "", 60);
      if(focusedId && focusedId !== ACTIVE_MONSTER_FOCUS_ALL){
        const focusedMonster = findActiveMonster(focusedId);
        visibleMonsters = focusedMonster ? [focusedMonster] : [];
      }else{
        visibleMonsters = activeMonsters;
      }
    }else{
      const targetId = getEncounterMonsterIdForPc(getUserSlot(), { usePublished: true });
      const targetMonster = targetId ? findPublishedEncounterMonster(targetId) : null;
      visibleMonsters = targetMonster ? [targetMonster] : publishedMonsters;
    }

    if(visibleMonsters.length === 0){
      listWrap.innerHTML = admin
        ? '<div class="muted">준비된 몬스터가 없습니다. [몬스터 추가]로 먼저 준비하세요.</div>'
        : '<div class="muted">현재 공개된 전투 몬스터가 없습니다. GM이 [전투 적용]을 누르면 표시됩니다.</div>';
      return;
    }

    listWrap.innerHTML = "";
    for(let index = 0; index < visibleMonsters.length; index += 1){
      const rawMonster = visibleMonsters[index];
      const isRuntimeMonster = !!(rawMonster && typeof rawMonster === "object" && ("hpNow" in rawMonster || "hpMax" in rawMonster));
      const monster = isRuntimeMonster
        ? normalizeActiveMonster(rawMonster, index)
        : normalizeActiveMonster({
          id: safeText((rawMonster && rawMonster.id) || "", 60),
          templateId: safeText((rawMonster && rawMonster.id) || "", 60),
          name: safeText((rawMonster && rawMonster.name) || `몬스터${index + 1}`, 40),
          image: sanitizeMonsterImageDataUrl((rawMonster && rawMonster.image) || ""),
          hpNow: clamp(toInt((rawMonster && rawMonster.hp) || 0), 0, 999999),
          hpMax: clamp(toInt((rawMonster && rawMonster.hp) || 1), 1, 999999),
          dc: clamp(toInt((rawMonster && rawMonster.dc) || 12), 1, 99999),
          eva: clamp(toInt((rawMonster && rawMonster.eva) || 0), -999, 999),
          statusEffects: sanitizeStatusEffects((rawMonster && rawMonster.statusEffects) || []),
          targetPlayerSlot: normalizeMonsterTargetPlayerSlot(rawMonster && rawMonster.targetPlayerSlot),
          targetFollowerId: normalizeMonsterTargetFollowerId(rawMonster && (rawMonster.targetFollowerId ?? rawMonster.targetNpcId)),
          statusMemo: safeMemo((rawMonster && rawMonster.note) || "", 500),
          damageDiceSides: normalizeDamageDiceSides(rawMonster && rawMonster.damageDiceSides, 6),
          attackHitBonus: clamp(toInt((rawMonster && (rawMonster.attackHitBonus ?? rawMonster.hitBonus)) || 0), -99, 99),
          extraDamage: clamp(toInt((rawMonster && rawMonster.extraDamage) || 0), -999, 999),
          dcBonus: clamp(toInt((rawMonster && rawMonster.dcBonus) || 0), -99, 99),
          dcPublic: parseBooleanFlag(rawMonster && rawMonster.dcPublic)
            || parseBooleanFlag(rawMonster && rawMonster.showDc)
            || parseBooleanFlag(rawMonster && rawMonster.dcVisible)
        }, index);
      const displayName = getMonsterDisplayNameFromMap(monster, admin ? activeNameMap : publishedNameMap);
      const box = document.createElement("div");
      box.className = "monsterOpsCard";
      box.style.marginTop = "8px";
      if(!admin) box.classList.add("monsterUserCard");

      const sourceLabel = isRuntimeMonster ? (monster.templateId ? "템플릿 기반" : "수동") : "템플릿";
      const linkedTemplate = monster.templateId ? findMonsterTemplate(monster.templateId) : null;
      const templateName = linkedTemplate
        ? linkedTemplate.name
        : (monster.templateId ? "알 수 없는 템플릿" : "");

      const hpMax = Math.max(1, clamp(toInt(monster.hpMax), 1, 999999));
      const hpNow = clamp(toInt(monster.hpNow), 0, hpMax);
      const hpRatio = hpMax <= 0 ? 0 : clamp(hpNow / hpMax, 0, 1);
      const hpStateClass = hpRatio <= 0.3 ? "danger" : (hpRatio <= 0.6 ? "warn" : "safe");
      const hpLine = document.createElement("div");
      hpLine.className = "monsterHpLine";
      hpLine.textContent = `HP ${hpNow}/${hpMax}`;
      const hpBar = document.createElement("div");
      hpBar.className = "monsterHpBar";
      const hpFill = document.createElement("span");
      hpFill.className = `monsterHpBarFill ${hpStateClass}`;
      hpFill.style.width = `${(hpRatio * 100).toFixed(1)}%`;
      hpBar.appendChild(hpFill);

      const monsterInjuryBoard = renderMonsterInjuryBoard(monster.id, monster, !admin);
      if(!admin){
        const head = document.createElement("div");
        head.className = "listRow monsterHead monsterUserHead";
        const imageThumb = document.createElement("img");
        imageThumb.className = "monsterThumb";
        imageThumb.alt = `${displayName} 이미지`;
        imageThumb.src = getMonsterImageSrc(monster);
        imageThumb.loading = "lazy";
        imageThumb.decoding = "async";
        const headText = document.createElement("div");
        headText.className = "listText monsterHeadText";
        headText.textContent = displayName;
        const targetBadge = buildMonsterTargetBadge(monster);
        head.appendChild(imageThumb);
        head.appendChild(headText);
        head.appendChild(targetBadge);
        box.appendChild(head);
        box.appendChild(hpLine);
        box.appendChild(hpBar);
        const userStatusWrap = document.createElement("div");
        userStatusWrap.className = "statusMiniWrap monsterUserStatusWrap";
        renderStatusBadgesInto(userStatusWrap, monster.statusEffects, STATUS_EFFECTS.length, { hideOverflowChip: true });
        box.appendChild(userStatusWrap);

        const userLayout = document.createElement("div");
        userLayout.className = "monsterUserLayout";
        userLayout.style.marginTop = "8px";

        const injuryCol = document.createElement("div");
        injuryCol.className = "monsterUserInjuryCol";
        monsterInjuryBoard.style.marginTop = "0";
        injuryCol.appendChild(monsterInjuryBoard);

        const memoCol = document.createElement("div");
        memoCol.className = "monsterUserMemoCol";
        const memoBody = document.createElement("div");
        memoBody.className = "monsterUserMemo";
        const memoText = safeMemo(monster.statusMemo || "", 500).trim();
        memoBody.textContent = memoText || "표시된 상태 메모가 없습니다.";
        memoCol.appendChild(memoBody);

        userLayout.appendChild(memoCol);
        userLayout.appendChild(injuryCol);
        box.appendChild(userLayout);
        listWrap.appendChild(box);
        continue;
      }

      const details = document.createElement("details");
      details.className = "monsterAdminCardDetails";
      details.open = expandedMonsterAdminCards.has(monster.id);
      details.addEventListener("toggle", () => {
        if(details.open) expandedMonsterAdminCards.add(monster.id);
        else expandedMonsterAdminCards.delete(monster.id);
      });

      const summary = document.createElement("summary");
      summary.className = "monsterAdminCardSummary";
      const summaryHead = document.createElement("div");
      summaryHead.className = "listRow monsterHead monsterAdminSummaryHead";
      const summaryImage = document.createElement("img");
      summaryImage.className = "monsterThumb";
      summaryImage.alt = `${displayName} 이미지`;
      summaryImage.src = getMonsterImageSrc(monster);
      summaryImage.loading = "lazy";
      summaryImage.decoding = "async";
      const summaryText = document.createElement("div");
      summaryText.className = "monsterAdminSummaryText";
      const summaryName = document.createElement("div");
      summaryName.className = "monsterAdminSummaryName";
      summaryName.textContent = displayName;
      const summaryMeta = document.createElement("div");
      summaryMeta.className = "monsterAdminSummaryMeta";
      const templateText = templateName ? `템플릿 ${templateName} | ` : "";
      const dcOpenText = monster.dcPublic ? "공개" : "비공개";
      summaryMeta.textContent = `${templateText}${sourceLabel} | DC(${dcOpenText}) ${formatDcWithBonus(monster.dc, monster.dcBonus)} | 회피 ${monster.eva >= 0 ? "+" : ""}${monster.eva} | 적중보정 ${formatSignedNumber(monster.attackHitBonus)} | 피해 ${getDamageDiceLabel(monster.damageDiceSides)}`;
      summaryText.appendChild(summaryName);
      summaryText.appendChild(summaryMeta);
      const summaryRight = document.createElement("div");
      summaryRight.className = "monsterSummaryRight";
      const summaryAttackSelectBtn = buildMonsterAttackSelectButton(monster, { stopSummaryToggle: true });
      const summaryTargetBadge = buildMonsterTargetBadge(monster);
      summaryRight.appendChild(summaryAttackSelectBtn);
      summaryRight.appendChild(summaryTargetBadge);
      summaryHead.appendChild(summaryImage);
      summaryHead.appendChild(summaryText);
      summaryHead.appendChild(summaryRight);
      summary.appendChild(summaryHead);
      summary.appendChild(hpLine);
      summary.appendChild(hpBar);
      summary.appendChild(buildMonsterTargetQuickRow(monster));
      const summaryMemo = document.createElement("div");
      summaryMemo.className = "monsterAdminSummaryMemo";
      const summaryMemoText = safeMemo(monster.statusMemo || "", 500).trim();
      summaryMemo.textContent = summaryMemoText || "상태 메모 없음";
      summary.appendChild(summaryMemo);
      const summaryStatusWrap = document.createElement("div");
      summaryStatusWrap.className = "statusMiniWrap monsterStatusSummary";
      renderStatusBadgesInto(summaryStatusWrap, monster.statusEffects, STATUS_EFFECTS.length, { hideOverflowChip: true });
      summary.appendChild(summaryStatusWrap);
      details.appendChild(summary);

      const body = document.createElement("div");
      body.className = "monsterAdminCardBody";

      const headActions = document.createElement("div");
      headActions.className = "listActions monsterAdminActionRow";
      const selectAttackBtn = buildMonsterAttackSelectButton(monster);
      const hpDown5 = document.createElement("button");
      hpDown5.type = "button";
      hpDown5.textContent = "피해 -5";
      hpDown5.addEventListener("click", () => mutateActiveMonster(monster.id, (draft) => {
        draft.hpNow = clamp(toInt(draft.hpNow) - 5, 0, clamp(toInt(draft.hpMax || 1), 1, 999999));
      }));
      const hpDown1 = document.createElement("button");
      hpDown1.type = "button";
      hpDown1.textContent = "피해 -1";
      hpDown1.addEventListener("click", () => mutateActiveMonster(monster.id, (draft) => {
        draft.hpNow = clamp(toInt(draft.hpNow) - 1, 0, clamp(toInt(draft.hpMax || 1), 1, 999999));
      }));
      const hpUp1 = document.createElement("button");
      hpUp1.type = "button";
      hpUp1.textContent = "회복 +1";
      hpUp1.addEventListener("click", () => mutateActiveMonster(monster.id, (draft) => {
        draft.hpNow = clamp(toInt(draft.hpNow) + 1, 0, clamp(toInt(draft.hpMax || 1), 1, 999999));
      }));
      const hpUp5 = document.createElement("button");
      hpUp5.type = "button";
      hpUp5.textContent = "회복 +5";
      hpUp5.addEventListener("click", () => mutateActiveMonster(monster.id, (draft) => {
        draft.hpNow = clamp(toInt(draft.hpNow) + 5, 0, clamp(toInt(draft.hpMax || 1), 1, 999999));
      }));
      const dcUp1 = document.createElement("button");
      dcUp1.type = "button";
      dcUp1.textContent = "DC +1";
      dcUp1.addEventListener("click", () => mutateActiveMonster(monster.id, (draft) => {
        draft.dc = clamp(toInt(draft.dc) + 1, 1, 99999);
      }));
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "제거";
      removeBtn.addEventListener("click", () => removeActiveMonster(monster.id));
      headActions.appendChild(selectAttackBtn);
      headActions.appendChild(hpDown5);
      headActions.appendChild(hpDown1);
      headActions.appendChild(hpUp1);
      headActions.appendChild(hpUp5);
      headActions.appendChild(dcUp1);
      headActions.appendChild(removeBtn);
      body.appendChild(headActions);

      const makeField = (label, inputEl, options = {}) => {
        const wrap = document.createElement("div");
        if(options.full) wrap.classList.add("full");
        const lab = document.createElement("label");
        lab.textContent = label;
        wrap.appendChild(lab);
        wrap.appendChild(inputEl);
        return wrap;
      };

      const hpNowInput = document.createElement("input");
      hpNowInput.type = "number";
      hpNowInput.min = "0";
      hpNowInput.max = String(monster.hpMax);
      hpNowInput.value = String(monster.hpNow);
      hpNowInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        const maxHp = clamp(toInt(draft.hpMax || 1), 1, 999999);
        draft.hpNow = clamp(toInt(hpNowInput.value), 0, maxHp);
      }));

      const hpMaxInput = document.createElement("input");
      hpMaxInput.type = "number";
      hpMaxInput.min = "1";
      hpMaxInput.value = String(monster.hpMax);
      hpMaxInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.hpMax = clamp(toInt(hpMaxInput.value), 1, 999999);
        draft.hpNow = clamp(toInt(draft.hpNow), 0, draft.hpMax);
      }));

      const dcInput = document.createElement("input");
      dcInput.type = "number";
      dcInput.min = "1";
      dcInput.value = String(monster.dc);
      dcInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.dc = clamp(toInt(dcInput.value), 1, 99999);
      }));

      const evaInput = document.createElement("input");
      evaInput.type = "number";
      evaInput.value = String(monster.eva);
      evaInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.eva = clamp(toInt(evaInput.value), -999, 999);
      }));

      const attackHitBonusInput = document.createElement("input");
      attackHitBonusInput.type = "number";
      attackHitBonusInput.value = String(clamp(toInt(monster.attackHitBonus || 0), -99, 99));
      attackHitBonusInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.attackHitBonus = clamp(toInt(attackHitBonusInput.value), -99, 99);
      }));

      const dcBonusInput = document.createElement("input");
      dcBonusInput.type = "number";
      dcBonusInput.value = String(monster.dcBonus);
      dcBonusInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.dcBonus = clamp(toInt(dcBonusInput.value), -99, 99);
      }));

      const damageDiceSidesInput = document.createElement("select");
      for(const sides of [4, 6, 8, 10, 12, 20]){
        const option = document.createElement("option");
        option.value = String(sides);
        option.textContent = getDamageDiceLabel(sides);
        damageDiceSidesInput.appendChild(option);
      }
      damageDiceSidesInput.value = String(normalizeDamageDiceSides(monster.damageDiceSides, 6));
      damageDiceSidesInput.addEventListener("change", () => {
        const nextSides = normalizeDamageDiceSides(damageDiceSidesInput.value, 6);
        mutateActiveMonster(monster.id, (draft) => {
          draft.damageDiceSides = nextSides;
        });
        if(safeText(selectedMonsterAttackId || "", 60) === monster.id){
          setDamageDiceSidesInUi(nextSides, { updateDiceShape: true, resetAutoType: true });
        }
      });

      const extraDamageInput = document.createElement("input");
      extraDamageInput.type = "number";
      extraDamageInput.value = String(monster.extraDamage);
      extraDamageInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.extraDamage = clamp(toInt(extraDamageInput.value), -999, 999);
      }));

      const memoInput = document.createElement("textarea");
      memoInput.rows = 5;
      memoInput.maxLength = 500;
      memoInput.className = "monsterAdminMemoInput";
      memoInput.value = safeText(safeMemo(monster.statusMemo || "", 500), 500);
      memoInput.placeholder = "상태 메모";
      memoInput.addEventListener("change", () => mutateActiveMonster(monster.id, (draft) => {
        draft.statusMemo = safeMemo(memoInput.value, 500);
      }));

      const monsterStatusEditor = document.createElement("div");
      monsterStatusEditor.className = "monsterStatusEditor";
      const monsterStatusControls = document.createElement("div");
      monsterStatusControls.className = "monsterStatusEditorControls";
      const activeMonsterStatuses = sanitizeStatusEffects(monster.statusEffects);
      if(activeMonsterStatuses.length > 0){
        const clearStatusBtn = document.createElement("button");
        clearStatusBtn.type = "button";
        clearStatusBtn.className = "statusExpandBtn";
        clearStatusBtn.textContent = "전체 해제";
        clearStatusBtn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          clearMonsterStatusEffectsByAdmin(monster.id);
        });
        monsterStatusControls.appendChild(clearStatusBtn);
      }
      if(monsterStatusControls.childElementCount > 0){
        monsterStatusEditor.appendChild(monsterStatusControls);
      }
      const monsterStatusGrid = document.createElement("div");
      monsterStatusGrid.className = "statusGrid monsterStatusGrid";
      for(const status of STATUS_EFFECTS){
        const statusBtn = document.createElement("button");
        statusBtn.type = "button";
        statusBtn.className = `statusToggleBtn status-${status.key}${activeMonsterStatuses.includes(status.key) ? " active" : ""}`;
        statusBtn.textContent = status.label;
        statusBtn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          toggleStatusEffectOnMonsterByAdmin(monster.id, status.key);
        });
        monsterStatusGrid.appendChild(statusBtn);
      }
      monsterStatusEditor.appendChild(monsterStatusGrid);

      const compactLayout = document.createElement("div");
      compactLayout.className = "monsterAdminCompactLayout";
      monsterInjuryBoard.style.marginTop = "0";
      compactLayout.appendChild(monsterInjuryBoard);

      const controlsCol = document.createElement("div");
      controlsCol.className = "monsterAdminCompactControls";

      const coreGrid = document.createElement("div");
      coreGrid.className = "monsterAdminFieldGrid";
      coreGrid.appendChild(makeField("현재 HP", hpNowInput));
      coreGrid.appendChild(makeField("최대 HP", hpMaxInput));
      coreGrid.appendChild(makeField("DC", dcInput));
      coreGrid.appendChild(makeField("회피", evaInput));
      controlsCol.appendChild(coreGrid);

      const advanced = document.createElement("details");
      advanced.className = "monsterAdminAdvanced";
      const advancedSummary = document.createElement("summary");
      advancedSummary.textContent = "추가 설정";
      advanced.appendChild(advancedSummary);

      const advancedGrid = document.createElement("div");
      advancedGrid.className = "monsterAdminAdvancedGrid";
      advancedGrid.appendChild(makeField("상태 메모", memoInput, { full: true }));
      advancedGrid.appendChild(makeField("상태 이상", monsterStatusEditor, { full: true }));
      advancedGrid.appendChild(makeField("DC 보너스", dcBonusInput));
      advancedGrid.appendChild(makeField("적중 보정", attackHitBonusInput));
      advancedGrid.appendChild(makeField("피해 주사위", damageDiceSidesInput));
      advancedGrid.appendChild(makeField("추가 데미지", extraDamageInput));
      advanced.appendChild(advancedGrid);
      controlsCol.appendChild(advanced);

      compactLayout.appendChild(controlsCol);
      body.appendChild(compactLayout);
      details.appendChild(body);
      box.appendChild(details);
      listWrap.appendChild(box);
    }
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

  function grantTemplateToPlayer(slot, templateId, qty){
    const pc = ensurePc(slot);
    const template = findTemplate(templateId);
    if(!template) return false;
    const grantQty = clamp(toInt(qty), 1, 9999);
    return addInventoryItemToPc(pc, {
      templateId: template.id,
      name: template.name,
      type: template.type,
      desc: template.desc,
      qty: grantQty
    }, grantQty);
  }

  function grantSelectedTemplate(){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const templateId = $("adminGrantTemplate").value;
    const slot = clamp(toInt($("adminGrantSlot").value), 0, MAX_PLAYERS - 1);
    const qty = clamp(toInt($("adminGrantQty").value), 1, 9999);
    if(!templateId){
      alert("지급할 템플릿을 먼저 생성하세요.");
      return;
    }
    const ok = grantTemplateToPlayer(slot, templateId, qty);
    if(!ok){
      alert("템플릿을 찾지 못했습니다.");
      return;
    }
    if(slot === state.activePc) writePcToUI(state.pcs[slot]);
    render();
    saveLocal();
  }

  function mutateInventoryLocal(slot, inventoryId, action, options = {}){
    const pc = ensurePc(slot);
    const idx = pc.inventory.findIndex((it) => it.id === inventoryId);
    if(idx < 0) return false;
    const item = pc.inventory[idx];

    if(action === "consume"){
      if(item.type !== "consumable") return false;
      if(toInt(item.qty) > 1) item.qty = clamp(toInt(item.qty) - 1, 1, 99999);
      else pc.inventory.splice(idx, 1);
      return true;
    }

    if(action === "remove"){
      pc.inventory.splice(idx, 1);
      return true;
    }

    if(action === "give"){
      const targetSlot = clamp(toInt(options.targetSlot), 0, MAX_PLAYERS - 1);
      if(targetSlot === slot) return false;
      const currentQty = clamp(toInt(item.qty), 1, 99999);
      const moveQty = Math.min(currentQty, clamp(toInt(options.qty || 1), 1, 99999));
      const targetPc = ensurePc(targetSlot);
      const moved = addInventoryItemToPc(targetPc, item, moveQty);
      if(!moved) return false;
      if(currentQty > moveQty){
        item.qty = clamp(currentQty - moveQty, 1, 99999);
      }else{
        pc.inventory.splice(idx, 1);
      }
      return true;
    }

    return false;
  }

  function handleInventoryAction(action, inventoryId, options = {}){
    if(!inventoryId) return;

    if(isAdminRole()){
      state.pcs[state.activePc] = readPcFromUI();
      const ok = mutateInventoryLocal(state.activePc, inventoryId, action, options);
      if(!ok) return;
      writePcToUI(state.pcs[state.activePc]);
      render();
      saveLocal();
      return;
    }

    if(!socket || !socket.connected){
      alert("실시간 연결 후 사용할 수 있습니다.");
      return;
    }
    const mySlot = getUserSlot();
    if(state.activePc !== mySlot){
      setActivePc(mySlot, { skipSaveCurrent: true, skipSync: true });
    }
    const payload = { roomId: getRoomId(), userSlot: mySlot, action, inventoryId };
    if(action === "give"){
      const targetSlot = clamp(toInt(options.targetSlot), 0, MAX_PLAYERS - 1);
      if(targetSlot === mySlot){
        alert("자기 자신에게는 전달할 수 없습니다.");
        return;
      }
      payload.targetSlot = targetSlot;
      payload.qty = clamp(toInt(options.qty || 1), 1, 99999);
    }
    socket.emit("user_inventory_action", payload);
  }

  function applyNameChange(){
    const fallback = `User${state.activePc + 1}`;
    const nextName = safeText($("nameInput").value || $("pc_name").value || fallback, 24) || fallback;

    if(isAdminRole()){
      state.pcs[state.activePc] = readPcFromUI();
      state.pcs[state.activePc].name = nextName;
      $("pc_name").value = nextName;
      $("nameInput").value = nextName;
      render();
      saveLocal();
      return;
    }

    if(!socket || !socket.connected){
      alert("이름 변경은 실시간 연결 후 가능합니다.");
      return;
    }

    const mySlot = getUserSlot();
    socket.emit("user_rename_self", { roomId: getRoomId(), userSlot: mySlot, name: nextName });
  }

  function normalizeActionStateLayers(type, layers){
    if(type !== "plasma") return [];
    const list = Array.isArray(layers) ? layers : [];
    return list
      .map((layer, layerIdx) => normalizePlasmaLayer(layer, layerIdx))
      .map((layer) => ({
        id: safeText(layer.id || "", 60),
        shape: normalizeShapeForType("plasma", layer.shape),
        intensity: normalizeIntensity(layer.intensity),
        use: clamp(toInt(layer.use || 1), 1, 99)
      }))
      .slice(-20);
  }

  function normalizeActionStateSnapshot(raw){
    const source = raw && typeof raw === "object" ? raw : {};
    const type = normalizeAttackType(source.type);
    const skillBook = normalizePlasmaSkillBook(source.plasmaSkillBook);
    const activePlasmaSkillIdRaw = safeText(source.activePlasmaSkillId || "", 60);
    const activePlasmaSkillId = (activePlasmaSkillIdRaw && skillBook.some((entry) => entry.id === activePlasmaSkillIdRaw))
      ? activePlasmaSkillIdRaw
      : "";
    return {
      type,
      distance: DISTANCE_KEYS.includes(String(source.distance || "")) ? String(source.distance) : "close",
      plasmaRangeKind: String(source.plasmaRangeKind || "") === "far" ? "far" : "close",
      shape: normalizeShapeForType(type, source.shape),
      intensity: normalizeIntensity(source.intensity),
      multi: clamp(toInt(source.multi || 1), 1, type === "plasma" ? 999 : 1),
      plasmaLayers: [],
      plasmaSkillBook: skillBook,
      activePlasmaSkillId,
      targetMonsterId: safeText(source.targetMonsterId || "", 60)
    };
  }

  function getActionStateSignature(raw){
    const actionState = normalizeActionStateSnapshot(raw);
    const skillSig = actionState.plasmaSkillBook
      .map((entry) => `${entry.name}:${entry.rangeKind}:${entry.skillKind}:${entry.baseCost}:${toInt(entry.level || 1)}:${toInt(entry.buffHit)}:${toInt(entry.buffPow)}:${toInt(entry.hitBonus)}:${toInt(entry.powBonus)}:${safeText(entry.desc || "", 180)}`)
      .join("|");
    return `${actionState.type}/${actionState.distance}/${actionState.plasmaRangeKind}/${actionState.shape}/${actionState.intensity}/${actionState.multi}/${actionState.activePlasmaSkillId}/${actionState.targetMonsterId}/${skillSig}`;
  }

  function applyActionStateToPc(pc, rawActionState, kState = state.k){
    if(!pc || typeof pc !== "object") return;
    const actionState = normalizeActionStateSnapshot(rawActionState);
    const cap = getEffectivePlasmaCap(pc, getStatStep(kState));
    pc.type = actionState.type;
    pc.distance = actionState.distance;
    pc.plasmaRangeKind = actionState.plasmaRangeKind;
    pc.shape = normalizeShapeForType(actionState.type, actionState.shape);
    pc.intensity = actionState.intensity;
    pc.multi = clamp(toInt(actionState.multi || 1), 1, actionState.type === "plasma" ? cap : 1);
    pc.plasmaLayers = [];
    pc.plasmaSkillBook = normalizePlasmaSkillBook(actionState.plasmaSkillBook);
    pc.activePlasmaSkillId = safeText(actionState.activePlasmaSkillId || "", 60);
    pc.targetMonsterId = safeText(actionState.targetMonsterId || "", 60);
    if(pc.activePlasmaSkillId && !pc.plasmaSkillBook.some((entry) => entry.id === pc.activePlasmaSkillId)){
      pc.activePlasmaSkillId = "";
    }
  }

  function readUserActionStateForSync(pc, kState = state.k){
    const sourcePc = pc && typeof pc === "object" ? pc : ensurePc(getUserSlot());
    const next = normalizeActionStateSnapshot(sourcePc);
    const cap = getEffectivePlasmaCap(sourcePc, getStatStep(kState));
    next.multi = clamp(toInt(next.multi || 1), 1, next.type === "plasma" ? cap : 1);
    next.plasmaLayers = [];
    next.plasmaSkillBook = normalizePlasmaSkillBook(next.plasmaSkillBook);
    if(next.activePlasmaSkillId && !next.plasmaSkillBook.some((entry) => entry.id === next.activePlasmaSkillId)){
      next.activePlasmaSkillId = "";
    }
    return next;
  }

  function queueUserActionSync(immediate = false){
    if(isApplyingRemote || isAdminRole()) return;
    const mySlot = getUserSlot();
    if(state.activePc !== mySlot) return;
    state.pcs[state.activePc] = readPcFromUI();
    const previewActionState = readUserActionStateForSync(state.pcs[state.activePc]);
    const isOnline = !!(socket && socket.connected);
    pendingUserActionSync = {
      userSlot: mySlot,
      actionState: previewActionState,
      signature: getActionStateSignature(previewActionState),
      expiresAt: Date.now() + (isOnline ? USER_ACTION_PENDING_TTL_MS : USER_ACTION_PENDING_OFFLINE_TTL_MS)
    };

    const send = () => {
      if(isApplyingRemote || isAdminRole() || !socket || !socket.connected) return;
      const userSlot = getUserSlot();
      if(state.activePc !== userSlot) return;
      state.pcs[state.activePc] = readPcFromUI();
      const actionState = readUserActionStateForSync(state.pcs[state.activePc]);
      pendingUserActionSync = {
        userSlot,
        actionState,
        signature: getActionStateSignature(actionState),
        expiresAt: Date.now() + USER_ACTION_PENDING_TTL_MS
      };
      socket.emit("user_update_action_state", {
        roomId: getRoomId(),
        userSlot,
        actionState
      });
    };

    if(immediate){
      clearTimeout(userActionSyncTimer);
      userActionSyncTimer = null;
      if(isOnline) send();
      return;
    }

    clearTimeout(userActionSyncTimer);
    if(!isOnline){
      userActionSyncTimer = null;
      return;
    }
    userActionSyncTimer = setTimeout(send, 140);
  }

  function queueMemoSync(){
    clearTimeout(memoSyncTimer);
    memoSyncTimer = setTimeout(() => {
      const memo = safeMemo($("userMemo").value, 2000);

      if(isAdminRole()){
        state.pcs[state.activePc] = readPcFromUI();
        saveLocal();
        queueAdminSync(false);
        return;
      }

      const mySlot = getUserSlot();
      if(state.activePc !== mySlot){
        setActivePc(mySlot, { skipSaveCurrent: true, skipSync: true });
      }
      state.pcs[mySlot] = Object.assign(defaultPC(mySlot), state.pcs[mySlot] || {});
      state.pcs[mySlot].memo = memo;
      saveLocal();

      if(socket && socket.connected){
        socket.emit("user_update_memo", {
          roomId: getRoomId(),
          userSlot: mySlot,
          memo
        });
      }
    }, 180);
  }

  function formatItemLine(item, qty){
    const typeLabel = item.type === "consumable" ? "소모품" : "아이템";
    const amount = clamp(toInt(qty), 1, 99999);
    const head = `[${typeLabel}] ${item.name} x${amount}`;
    const desc = safeItemDesc(item.desc || "", 500);
    return desc ? `${head}\n${desc}` : head;
  }

  function getInventoryFilterType(){
    const value = String(($("inventoryFilterType") && $("inventoryFilterType").value) || "all");
    if(value === "item" || value === "consumable") return value;
    return "all";
  }

  function syncInventoryGiveTargetOptions(){
    const select = $("inventoryGiveTarget");
    if(!select) return;
    const ownerSlot = isAdminRole() ? state.activePc : getUserSlot();
    const prev = String(select.value || "");
    select.innerHTML = "";
    const options = [];
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      if(i === ownerSlot) continue;
      options.push(i);
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = getPlayerSlotLabel(i);
      select.appendChild(option);
    }
    select.disabled = options.length === 0;
    if(options.length === 0){
      const option = document.createElement("option");
      option.value = String(ownerSlot);
      option.textContent = "전달 대상 없음";
      select.appendChild(option);
      select.value = String(ownerSlot);
      return;
    }
    select.value = options.some((idx) => String(idx) === prev) ? prev : String(options[0]);
  }

  function getInventoryGiveTargetSlot(){
    const select = $("inventoryGiveTarget");
    if(!select || select.disabled) return null;
    const value = clamp(toInt(select.value), 0, MAX_PLAYERS - 1);
    const ownerSlot = isAdminRole() ? state.activePc : getUserSlot();
    if(value === ownerSlot) return null;
    return value;
  }

  function compareKoText(a, b){
    const left = safeText(a || "", 80);
    const right = safeText(b || "", 80);
    if(KO_SORT_COLLATOR) return KO_SORT_COLLATOR.compare(left, right);
    return left.localeCompare(right, "ko");
  }

  function compareInventoryItems(a, b){
    const nameDiff = compareKoText(a && a.name ? a.name : "", b && b.name ? b.name : "");
    if(nameDiff !== 0) return nameDiff;
    const typeDiff = compareKoText(a && a.type ? a.type : "", b && b.type ? b.type : "");
    if(typeDiff !== 0) return typeDiff;
    return compareKoText(a && a.id ? a.id : "", b && b.id ? b.id : "");
  }

  function compareItemTemplates(a, b){
    const nameDiff = compareKoText(a && a.name ? a.name : "", b && b.name ? b.name : "");
    if(nameDiff !== 0) return nameDiff;
    const typeDiff = compareKoText(a && a.type ? a.type : "", b && b.type ? b.type : "");
    if(typeDiff !== 0) return typeDiff;
    return compareKoText(a && a.id ? a.id : "", b && b.id ? b.id : "");
  }

  function renderTemplateControls(){
    const select = $("adminGrantTemplate");
    const list = $("adminTemplateList");
    const templates = Array.isArray(state.itemTemplates) ? state.itemTemplates : [];
    const sortedTemplates = templates.slice().sort(compareItemTemplates);
    const prevSelected = safeText((select && select.value) || "", 60);

    select.innerHTML = "";
    for(const tpl of sortedTemplates){
      const option = document.createElement("option");
      option.value = tpl.id;
      option.textContent = `${tpl.name} (${tpl.type === "consumable" ? "소모품" : "아이템"})`;
      select.appendChild(option);
    }
    if(sortedTemplates.length > 0){
      const selected = sortedTemplates.some((tpl) => tpl.id === prevSelected) ? prevSelected : sortedTemplates[0].id;
      select.value = selected;
    }

    if(sortedTemplates.length === 0){
      list.innerHTML = '<div class="muted">생성된 템플릿이 없습니다.</div>';
      if(safeText(editingItemTemplateId || "", 60)){
        clearItemTemplateEditor();
      }else{
        syncItemTemplateEditorUi();
      }
      return;
    }

    list.innerHTML = "";
    for(const tpl of sortedTemplates){
      const row = document.createElement("div");
      row.className = "listRow";

      const left = document.createElement("div");
      left.className = "listText";
      left.style.whiteSpace = "pre-line";
      left.textContent = formatItemLine(tpl, tpl.baseQty);

      const right = document.createElement("div");
      right.className = "listActions";
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "수정";
      editBtn.addEventListener("click", () => beginEditItemTemplate(tpl.id));
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "템플릿 삭제";
      removeBtn.dataset.templateId = tpl.id;
      removeBtn.id = `tpl_remove_${tpl.id}`;
      removeBtn.addEventListener("click", () => removeItemTemplate(tpl.id));
      right.appendChild(editBtn);
      right.appendChild(removeBtn);

      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    }
    syncItemTemplateEditorUi();
  }

  function renderNpcTemplateControls(){
    const select = $("adminNpcTemplateSelect");
    if(!select) return;
    const templates = Array.isArray(state.npcTemplates) ? state.npcTemplates : [];
    const prevSelected = safeText(select.value || "", 60);
    select.innerHTML = "";

    if(templates.length <= 0){
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "저장된 템플릿 없음";
      select.appendChild(empty);
      select.value = "";
    }else{
      for(const tpl of templates){
        const option = document.createElement("option");
        option.value = tpl.id;
        option.textContent = `${tpl.name} (HP ${tpl.hpMax} / DC ${clamp(toInt(tpl.dc ?? PLAYER_BASE_DC), 1, 99999)} / PL ${tpl.plasmaMax} / 적중 ${formatSignedNumber(tpl.hitBonus)} / 위력 ${formatSignedNumber(tpl.powBonus)})`;
        select.appendChild(option);
      }
      select.value = templates.some((tpl) => tpl.id === prevSelected) ? prevSelected : templates[0].id;
    }

    const applyBtn = $("adminNpcTemplateApplyBtn");
    const removeBtn = $("adminNpcTemplateDeleteBtn");
    const hasTemplates = templates.length > 0;
    if(applyBtn) applyBtn.disabled = !hasTemplates;
    if(removeBtn) removeBtn.disabled = !hasTemplates;
  }

  function renderInventory(){
    const wrap = $("inventoryList");
    const pc = ensurePc(state.activePc);
    const rawList = Array.isArray(pc.inventory) ? pc.inventory : [];
    const filterType = getInventoryFilterType();
    syncInventoryGiveTargetOptions();
    const targetSlot = getInventoryGiveTargetSlot();
    const list = rawList
      .filter((item) => filterType === "all" || item.type === filterType)
      .slice()
      .sort(compareInventoryItems);

    if(rawList.length === 0){
      wrap.innerHTML = '<div class="muted">인벤토리가 비어 있습니다.</div>';
      return;
    }

    if(list.length === 0){
      wrap.innerHTML = '<div class="muted">선택한 필터에 해당하는 아이템이 없습니다.</div>';
      return;
    }

    wrap.innerHTML = "";
    for(const item of list){
      const row = document.createElement("div");
      row.className = "listRow";

      const left = document.createElement("div");
      left.className = "listText";
      left.style.whiteSpace = "pre-line";
      left.textContent = formatItemLine(item, item.qty);

      const right = document.createElement("div");
      right.className = "listActions";

      if(item.type === "consumable"){
        const consumeBtn = document.createElement("button");
        consumeBtn.type = "button";
        consumeBtn.textContent = "사용(-1)";
        consumeBtn.dataset.userAllowed = "1";
        consumeBtn.addEventListener("click", () => handleInventoryAction("consume", item.id));
        right.appendChild(consumeBtn);
      }

      if(!isAdminRole()){
        const giveBtn = document.createElement("button");
        giveBtn.type = "button";
        giveBtn.textContent = "주기(-1)";
        giveBtn.dataset.userAllowed = "1";
        giveBtn.disabled = targetSlot === null;
        giveBtn.addEventListener("click", () => {
          const currentTarget = getInventoryGiveTargetSlot();
          if(currentTarget === null){
            alert("주기 대상을 먼저 선택하세요.");
            return;
          }
          handleInventoryAction("give", item.id, { targetSlot: currentTarget, qty: 1 });
        });
        right.appendChild(giveBtn);

        const dropBtn = document.createElement("button");
        dropBtn.type = "button";
        dropBtn.textContent = "버리기";
        dropBtn.dataset.userAllowed = "1";
        dropBtn.addEventListener("click", () => handleInventoryAction("remove", item.id));
        right.appendChild(dropBtn);
      }

      if(isAdminRole()){
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "목록 제거";
        removeBtn.addEventListener("click", () => handleInventoryAction("remove", item.id));
        right.appendChild(removeBtn);
      }

      row.appendChild(left);
      row.appendChild(right);
      wrap.appendChild(row);
    }
  }

  function renderUserInventoryMeta(){
    const pc = ensurePc(state.activePc);
    const fallback = `User${state.activePc + 1}`;
    $("userInventoryOwner").textContent = safeText(pc.name || fallback, 24) || fallback;
    $("userInventoryGold").textContent = String(clamp(toInt(pc.gold), 0, 999999999));
  }

  function renderUserCombatOverview(){
    const wrap = $("userCombatOverview");
    const enemyList = $("userCombatEnemyList");
    const allyList = $("userCombatAllyList");
    if(!wrap || !enemyList || !allyList) return;

    enemyList.innerHTML = "";
    allyList.innerHTML = "";

    if(isAdminRole()) return;

    const createItem = (name, meta, options = {}) => {
      const item = document.createElement("div");
      item.className = "userCombatItem";
      if(options.tone === "enemy") item.classList.add("enemy");
      if(options.tone === "ally") item.classList.add("ally");
      if(options.active) item.classList.add("active");
      const hpNow = clamp(toInt(options.hpNow), 0, 999999);
      const hpMax = clamp(toInt(options.hpMax), 1, 999999);
      if(options.hpNow !== undefined){
        const hpPercent = clamp(Math.round((hpNow / hpMax) * 100), 0, 100);
        const hpStateClass = hpPercent <= 30
          ? "hp-state-low"
          : (hpPercent <= 70 ? "hp-state-mid" : "hp-state-high");
        const criticalIntensity = hpPercent <= 30
          ? clamp((30 - hpPercent) / 30, 0, 1)
          : 0;
        item.classList.add(hpStateClass);
        item.style.setProperty("--hp-critical-intensity", criticalIntensity.toFixed(3));
      }

      const left = document.createElement("div");
      left.className = "userCombatName";
      left.textContent = name;

      const right = document.createElement("div");
      right.className = "userCombatMeta";
      right.textContent = meta;

      item.appendChild(left);
      item.appendChild(right);
      if(options.sub){
        const sub = document.createElement("div");
        sub.className = "userCombatSub";
        sub.textContent = options.sub;
        item.appendChild(sub);
      }
      return item;
    };

    const createMonsterCard = (monsterLike, options = {}) => {
      const raw = monsterLike && typeof monsterLike === "object" ? monsterLike : {};
      const name = safeText(options.displayName || raw.name || "몬스터", 80) || "몬스터";
      const hpMax = clamp(toInt(raw.hpMax || raw.hp || 1), 1, 999999);
      const hpNow = clamp(toInt(raw.hpNow ?? raw.hp ?? hpMax), 0, hpMax);
      const eva = clamp(toInt(raw.eva), -999, 999);
      const hpPercent = clamp(Math.round((hpNow / hpMax) * 100), 0, 100);
      const hpStateClass = hpPercent <= 30 ? "danger" : (hpPercent <= 70 ? "warn" : "safe");
      const note = safeMemo(raw.statusMemo || raw.note || options.note || "", 500).trim();
      const statusList = sanitizeStatusEffects(raw.statusEffects);

      const card = document.createElement("article");
      card.className = "userMonsterCard monsterUserCard";

      const head = document.createElement("div");
      head.className = "userMonsterHead";
      const image = document.createElement("img");
      image.className = "monsterThumb";
      image.alt = `${name} 이미지`;
      image.src = getMonsterImageSrc({ name, image: raw.image || "" });

      const headText = document.createElement("div");
      const title = document.createElement("div");
      title.className = "userMonsterName";
      title.textContent = name;
      const meta = document.createElement("div");
      meta.className = "userMonsterMeta";
      meta.textContent = `HP ${hpNow}/${hpMax} | 회피 ${eva >= 0 ? "+" : ""}${eva}`;
      headText.appendChild(title);
      headText.appendChild(meta);
      head.appendChild(image);
      head.appendChild(headText);

      const hpBar = document.createElement("div");
      hpBar.className = "monsterHpBar";
      const hpFill = document.createElement("span");
      hpFill.className = `monsterHpBarFill ${hpStateClass}`;
      hpFill.style.width = `${hpPercent}%`;
      hpBar.appendChild(hpFill);

      card.appendChild(head);
      card.appendChild(hpBar);
      const statusWrap = document.createElement("div");
      statusWrap.className = "statusMiniWrap userMonsterStatusWrap monsterUserStatusWrap";
      renderStatusBadgesInto(statusWrap, statusList, STATUS_EFFECTS.length, { hideOverflowChip: true });
      card.appendChild(statusWrap);

      const body = document.createElement("div");
      body.className = "monsterUserLayout";
      body.style.marginTop = "8px";

      const memoCol = document.createElement("div");
      memoCol.className = "monsterUserMemoCol";
      const memoBody = document.createElement("div");
      memoBody.className = "monsterUserMemo";
      memoBody.textContent = note || "표시된 상태 메모가 없습니다.";
      memoCol.appendChild(memoBody);

      const injuryCol = document.createElement("div");
      injuryCol.className = "monsterUserInjuryCol";
      const injuryBoard = renderMonsterInjuryBoard(safeText(raw.id || name, 60), raw, true);
      injuryBoard.classList.add("userMonsterInjuryBoard");
      injuryCol.appendChild(injuryBoard);

      body.appendChild(memoCol);
      body.appendChild(injuryCol);
      card.appendChild(body);
      return card;
    };

    const published = ensurePublishedActiveMonsters();
    if(published.length > 0){
      const publishedNameMap = buildMonsterDuplicateNameMap(published);
      for(const monster of published){
        enemyList.appendChild(createMonsterCard(monster, {
          displayName: getMonsterDisplayNameFromMap(monster, publishedNameMap)
        }));
      }
    }else{
      const enemyMap = new Map();
      for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
        const info = getTargetInfoForPc(slot);
        if(!info || info.source !== "monster") continue;
        const key = `${safeText(info.name || "", 80)}|${toInt(info.dc)}|${toInt(info.dcBonus)}|${toInt(info.eva)}`;
        if(enemyMap.has(key)) continue;
        enemyMap.set(key, info);
      }
      for(const info of enemyMap.values()){
        enemyList.appendChild(createMonsterCard({
          name: safeText(info.name || "적", 80) || "적",
          hpNow: 1,
          hpMax: 1,
          dc: clamp(toInt(info.dc), 1, 99999),
          dcBonus: clamp(toInt(info.dcBonus), -99, 99),
          eva: clamp(toInt(info.eva), -999, 999),
          note: safeText(info.note || "", 100) || ""
        }));
      }
    }

    if(enemyList.childElementCount <= 0){
      const empty = document.createElement("div");
      empty.className = "userCombatEmpty";
      empty.textContent = "현재 공개된 적이 없습니다.";
      enemyList.appendChild(empty);
    }

    const mySlot = clamp(toInt(getUserSlot()), 0, MAX_PLAYERS - 1);
    for(let slot = 0; slot < MAX_PLAYERS; slot += 1){
      const pc = ensurePc(slot);
      const name = safeText(pc.name || `User${slot + 1}`, 24) || `User${slot + 1}`;
      const hpMax = clamp(toInt(pc.hp), 0, 99999);
      const hpNow = clamp(toInt(pc.hpNow ?? hpMax), 0, hpMax);
      const plasmaNow = clamp(toInt(pc.plasmaNow), 0, 99999);
      const plasmaMax = clamp(toInt(pc.plasmaMax || pc.pool || 1), 1, 99999);
      const hunger = clamp(toInt(pc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
      const statusLabels = sanitizeStatusEffects(pc.statusEffects)
        .slice(0, 2)
        .map((key) => {
          const meta = getStatusMeta(key);
          return meta ? meta.label : "";
        })
        .filter(Boolean);
      const sub = statusLabels.length > 0
        ? `허기 ${hunger}/${HUNGER_MAX} | 상태 ${statusLabels.join(", ")}`
        : `허기 ${hunger}/${HUNGER_MAX}`;
      allyList.appendChild(createItem(
        name,
        `HP ${hpNow}/${hpMax} | PL ${plasmaNow}/${plasmaMax}`,
        { active: slot === mySlot, tone: "ally", sub, hpNow, hpMax: Math.max(1, hpMax) }
      ));
    }

    const followers = ensurePartyFollowers();
    for(const npc of followers){
      const name = safeText(npc.name || "동행 NPC", 40) || "동행 NPC";
      const hpNow = clamp(toInt(npc.hpNow), 0, 99999);
      const hpMax = clamp(toInt(npc.hpMax), 1, 99999);
      const plasmaNow = clamp(toInt(npc.plasmaNow), 0, 99999);
      const plasmaMax = clamp(toInt(npc.plasmaMax), 1, 99999);
      const hunger = clamp(toInt(npc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX);
      const note = safeText(npc.note || "", 80);
      allyList.appendChild(createItem(
        name,
        `NPC | HP ${hpNow}/${hpMax} | DC ${clamp(toInt(npc.dc ?? PLAYER_BASE_DC), 1, 99999)} | PL ${plasmaNow}/${plasmaMax}`,
        {
          tone: "ally",
          sub: note ? `허기 ${hunger}/${HUNGER_MAX} | ${note}` : `허기 ${hunger}/${HUNGER_MAX}`,
          hpNow,
          hpMax
        }
      ));
    }

    if(allyList.childElementCount <= 0){
      const empty = document.createElement("div");
      empty.className = "userCombatEmpty";
      empty.textContent = "표시할 동료 정보가 없습니다.";
      allyList.appendChild(empty);
    }
  }

  function renderPlayerTargetMonsterSelect(){
    const wrap = $("playerTargetMonsterWrap");
    const select = $("playerTargetMonsterSelect");
    const help = $("playerTargetMonsterHelp");
    if(!wrap || !select) return;

    const admin = isAdminRole();
    if(admin){
      wrap.style.display = "none";
      if(help) help.textContent = "";
      return;
    }
    wrap.style.display = "";

    const mySlot = clamp(toInt(getUserSlot()), 0, MAX_PLAYERS - 1);
    const pc = ensurePc(mySlot);
    const publishedEncounter = normalizeEncounterConfig(state.publishedEncounter || {});
    const publishedMonsters = ensurePublishedActiveMonsters();
    const publishedNameMap = buildMonsterDuplicateNameMap(publishedMonsters);
    const dynamicShared = safeText(publishedEncounter.sharedMonsterId || "", 60) === ENCOUNTER_SHARED_PLAYER_SELECTED_ID;
    const selectedId = safeText(pc.targetMonsterId || "", 60);

    select.innerHTML = "";
    const autoOption = document.createElement("option");
    autoOption.value = "";
    autoOption.textContent = "자동/미선택";
    select.appendChild(autoOption);

    for(const monster of publishedMonsters){
      const option = document.createElement("option");
      option.value = monster.id;
      const displayName = getMonsterDisplayNameFromMap(monster, publishedNameMap);
      const dcText = monster.dcPublic ? formatDcWithBonus(monster.dc, monster.dcBonus) : "비공개";
      option.textContent = `${displayName} [DC ${dcText} | 회피 ${formatSignedNumber(monster.eva)}]`;
      select.appendChild(option);
    }

    const hasSelected = Array.from(select.options).some((option) => option.value === selectedId);
    select.value = hasSelected ? selectedId : "";
    select.disabled = publishedMonsters.length <= 0;

    if(help){
      if(publishedMonsters.length <= 0){
        help.textContent = "선택 가능한 공개 몬스터가 없습니다.";
      }else if(dynamicShared){
        help.textContent = "선택 즉시 내 목표 DC가 선택 몬스터 기준으로 전환됩니다.";
      }else if(publishedEncounter.mode === "per_player"){
        help.textContent = "현재는 플레이어별 대상 모드입니다. 선택값은 저장되며, [공통 대상: 플레이어 선택(동적)]일 때 즉시 적용됩니다.";
      }else{
        help.textContent = "현재는 자동/고정 대상 모드입니다. 선택값은 저장되며, GM이 [공통 대상]을 [플레이어 선택 대상(동적)]으로 설정하면 즉시 적용됩니다.";
      }
    }
  }

  function renderTargetInfo(){
    const info = getTargetInfoForPc(state.activePc);
    const targetValue = getTargetValue(info);
    const adjustLabel = safeText(info.adjustLabel || "보정", 24) || "보정";
    const dcWithBonus = formatDcWithBonus(info.dc, info.dcBonus);
    const targetVisible = isDcVisibleToCurrentRole(info);
    const currentEnemyLabel = $("currentEnemyLabel");
    const currentEnemyMeta = $("currentEnemyMeta");
    if(currentEnemyLabel) currentEnemyLabel.textContent = info.name;
    if(currentEnemyMeta){
      currentEnemyMeta.textContent = targetVisible
        ? `모드: ${info.modeLabel} | 목표: ${targetValue} (DC ${dcWithBonus} + ${adjustLabel} ${info.eva})`
        : `모드: ${info.modeLabel} | 목표: ? (운영자 비공개)`;
    }
    $("userEnemyLabel").textContent = info.name;
    const playerTargetDc = $("playerTargetDc");
    if(playerTargetDc){
      playerTargetDc.textContent = targetVisible ? String(targetValue) : "?";
      playerTargetDc.title = targetVisible
        ? `${info.name} | DC ${dcWithBonus} + ${adjustLabel} ${info.eva}`
        : "운영자 비공개";
    }
  }

  function isDcVisibleToCurrentRole(targetInfo = null){
    if(isAdminRole()) return true;
    const info = (targetInfo && typeof targetInfo === "object") ? targetInfo : null;
    const byMonsterRule = !info || info.source !== "monster" || parseBooleanFlag(info.dcPublic);
    return !!state.showDcToUsers && byMonsterRule;
  }

  function renderTargetBadge(targetValue, targetInfo = null){
    const badge = $("judgeBadge");
    if(!badge) return;
    if(isDcVisibleToCurrentRole(targetInfo)){
      badge.textContent = `목표 ${targetValue}`;
      badge.className = "badge dcTargetReveal";
      return;
    }
    badge.textContent = "?";
    badge.className = "badge dcTargetHidden";
  }

  function setDiceTotalFx(text, tone = "neutral", options = {}){
    const el = $("diceTotalFx");
    if(!el) return;
    const allowed = new Set(["neutral", "pending", "success", "fail", "fumble", "critical", "damage"]);
    const nextTone = allowed.has(String(tone || "")) ? String(tone) : "neutral";
    const rawText = String(text ?? "").trim();
    el.textContent = rawText || "0";
    el.className = `diceTotalFx ${nextTone}`;
    const lockMs = clamp(toInt(options && options.lockMs), 0, 10000);
    if(lockMs > 0){
      diceTotalFxLockUntil = Date.now() + lockMs;
    }else if(options && options.clearLock){
      diceTotalFxLockUntil = 0;
    }
  }

  function syncDiceTotalFxFromComputed(result){
    if(Date.now() < diceTotalFxLockUntil) return;
    const finalHit = clamp(toInt(result && result.finalHit), -99999, 99999);
    setDiceTotalFx(String(finalHit), "neutral", { clearLock: true });
  }

  function holdHitDiceDisplay(ms = 3000){
    const holdMs = clamp(toInt(ms), 0, 10000);
    diceDamageShapeHoldUntil = Date.now() + holdMs;
    if(diceDamageShapeHoldTimer){
      clearTimeout(diceDamageShapeHoldTimer);
      diceDamageShapeHoldTimer = null;
    }
    diceDamageShapeHoldTimer = setTimeout(() => {
      diceDamageShapeHoldTimer = null;
      if(Date.now() < diceDamageShapeHoldUntil) return;
      diceDamageShapeHoldUntil = 0;
      render({ skipSync: true });
    }, holdMs + 40);
  }

  function clearHitDiceDisplayHold(){
    diceDamageShapeHoldUntil = 0;
    if(diceDamageShapeHoldTimer){
      clearTimeout(diceDamageShapeHoldTimer);
      diceDamageShapeHoldTimer = null;
    }
  }

  function renderPlasmaHud(){
    const pc = ensurePc(state.activePc);
    const current = clamp(toInt(pc.plasmaNow), 0, 99999);
    const max = clamp(toInt(pc.plasmaMax), 1, 99999);
    const cap = getEffectivePlasmaCap(pc, getStatStep(state.k));
    const activeSkill = getPcActivePlasmaSkill(pc);
    const autoSkillUse = activeSkill ? clamp(getPlasmaSkillUseAmount(activeSkill), 1, cap) : null;
    const useValue = (autoSkillUse === null) ? clamp(toInt(pc.multi || 1), 1, cap) : autoSkillUse;
    if(autoSkillUse !== null){
      pc.multi = useValue;
    }

    $("plasmaEnergyText").textContent = `${current} / ${max}`;
    $("plasmaCapText").textContent = String(cap);
    $("plasmaCapText").title = `현재 동시 사용 한도 ${cap}`;
    $("multi").max = String(cap);
    $("multi").min = "1";
    $("multi").value = String(useValue);

    const orbWrap = $("plasmaOrbs");
    const visibleMax = Math.min(max, 40);
    orbWrap.innerHTML = "";
    for(let i = 0; i < visibleMax; i += 1){
      const orb = document.createElement("span");
      orb.className = `plasmaOrb ${i < current ? "on" : ""}`;
      orb.title = `${i + 1}/${max}`;
      orbWrap.appendChild(orb);
    }

    if(max > visibleMax){
      const more = document.createElement("span");
      more.className = "small";
      more.textContent = `+${max - visibleMax}`;
      orbWrap.appendChild(more);
    }
  }

  function applyPlasmaLayer(){
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    if(!isPlasmaType(pc.type)){
      alert("플라즈마 공격에서만 레이어를 적용할 수 있습니다.");
      return;
    }

    const nextLayer = getCurrentPlasmaLayerFromPc(pc);
    pc.plasmaLayers = Array.isArray(pc.plasmaLayers) ? pc.plasmaLayers : [];
    pc.plasmaLayers.push(nextLayer);
    if(pc.plasmaLayers.length > 20){
      pc.plasmaLayers = pc.plasmaLayers.slice(-20);
    }
    render();
    saveLocal();
    queueUserActionSync(true);
  }

  function undoPlasmaLayer(){
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    pc.plasmaLayers = Array.isArray(pc.plasmaLayers) ? pc.plasmaLayers : [];
    if(pc.plasmaLayers.length <= 0) return;
    pc.plasmaLayers.pop();
    render();
    saveLocal();
    queueUserActionSync(true);
  }

  function clearPlasmaLayers(){
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    pc.plasmaLayers = [];
    render();
    saveLocal();
    queueUserActionSync(true);
  }

  function removePlasmaLayer(layerId){
    if(!layerId) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(state.activePc);
    pc.plasmaLayers = (Array.isArray(pc.plasmaLayers) ? pc.plasmaLayers : []).filter((layer) => layer.id !== layerId);
    render();
    saveLocal();
    queueUserActionSync(true);
  }

  function renderPlasmaLayers(){
    const pc = ensurePc(state.activePc);
    const wrap = $("plasmaLayerList");
    const totalEl = $("plasmaLayerUseTotal");
    if(!wrap || !totalEl) return;

    const layers = Array.isArray(pc.plasmaLayers) ? pc.plasmaLayers.map((layer, idx) => normalizePlasmaLayer(layer, idx)).slice(-20) : [];
    const totalUse = sumPlasmaLayerUse(layers);
    const stabilizeActive = isStabilizeLayerActive(layers);
    totalEl.textContent = stabilizeActive ? `${totalUse} (+안정화 1)` : `${totalUse}`;

    if(layers.length <= 0){
      wrap.innerHTML = '<div class="muted">적용된 레이어가 없습니다. 플라즈마 공격 설정 후 "플라즈마 적용"을 눌러 누적하세요.</div>';
      return;
    }

    wrap.innerHTML = "";
    for(let i = 0; i < layers.length; i += 1){
      const layer = layers[i];
      const row = document.createElement("div");
      row.className = "listRow";

      const left = document.createElement("div");
      left.className = "listText";
      const intensityLabel = (layer.intensity === "high") ? "강" : (layer.intensity === "low" ? "약" : "중");
      left.textContent = `${i + 1}. ${getShapeLabel("plasma", layer.shape)} / ${intensityLabel} / 사용 ${layer.use}`;

      const right = document.createElement("div");
      right.className = "listActions";
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "제거";
      removeBtn.dataset.userAllowed = "1";
      removeBtn.addEventListener("click", () => removePlasmaLayer(layer.id));
      right.appendChild(removeBtn);

      row.appendChild(left);
      row.appendChild(right);
      wrap.appendChild(row);
    }
  }

  function syncActionLocks(){
    const attackType = normalizeAttackType($("attackType").value);
    const intensity = normalizeIntensity($("intensity").value);
    const activePc = ensurePc(state.activePc);
    const cap = getEffectivePlasmaCap(activePc, getStatStep(state.k));
    const multiInput = $("multi");
    const extraMeta = $("plasmaExtraMeta");
    const plasmaPanel = $("plasmaPanel");
    multiInput.max = String(cap);
    if(plasmaPanel){
      plasmaPanel.style.display = "";
    }
    if(extraMeta) extraMeta.textContent = "현재 플라즈마 보유량입니다. 템플릿 적용 시 사용량이 자동 반영됩니다.";

    if(attackType !== "plasma"){
      multiInput.value = "1";
      multiInput.disabled = true;
      multiInput.title = "플라즈마 공격에서만 다중 사용을 설정합니다.";
      return;
    }

    if(intensity === "high") multiInput.title = "강도 강: 다중 사용 시 리스크가 누적됩니다.";
    else if(intensity === "mid") multiInput.title = "강도 중: 기본 1 사용이지만 다중 사용으로 조정할 수 있습니다.";
    else multiInput.title = "강도 약: 약한 플라즈마도 다중 사용으로 조정할 수 있습니다.";
    multiInput.disabled = false;
  }

  function finalizeAdminMutation(options = {}){
    if(!isAdminRole()) return;
    const skipRead = !!(options && options.skipRead);
    render({ skipRead, skipSync: true });
    saveLocal();
    queueAdminSync(true);
  }

  function adjustGoldByAdmin(slot, delta){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.gold = clamp(toInt(pc.gold) + toInt(delta), 0, 999999999);
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function adjustAlwaysHitByAdmin(slot, delta){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.alwaysHit = clamp(toInt(pc.alwaysHit) + toInt(delta), -99, 99);
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function adjustAlwaysPowByAdmin(slot, delta){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.alwaysPow = clamp(toInt(pc.alwaysPow) + toInt(delta), -99, 99);
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function setDistanceByAdmin(slot, value){
    if(!isAdminRole()) return;
    const nextDistance = DISTANCE_KEYS.includes(String(value || "")) ? String(value) : "close";
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.distance = nextDistance;
    if(slot === state.activePc){
      writePcToUI(pc);
      const distanceStateEl = $("distanceState");
      if(distanceStateEl) distanceStateEl.value = nextDistance;
    }
    finalizeAdminMutation({ skipRead: true });
  }

  function setAttackRangeByAdmin(slot, value){
    if(!isAdminRole()) return;
    const nextAttackRange = String(value || "") === "far" ? "far" : "close";
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.plasmaRangeKind = nextAttackRange;
    if(slot === state.activePc){
      writePcToUI(pc);
      const attackRangeStateEl = $("attackRangeState");
      if(attackRangeStateEl) attackRangeStateEl.value = nextAttackRange;
    }
    finalizeAdminMutation({ skipRead: true });
  }

  function setHungerByAdmin(slot, value){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    pc.hunger = clamp(toInt(value), 0, HUNGER_MAX);
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function grantGoldToTarget(){
    if(!isAdminRole()) return;
    const amount = clamp(toInt($("adminGoldAmount").value), 1, 999999999);
    adjustGoldByAdmin(getAdminTargetSlot(), amount);
  }

  function takeGoldFromTarget(){
    if(!isAdminRole()) return;
    const amount = clamp(toInt($("adminGoldAmount").value), 1, 999999999);
    adjustGoldByAdmin(getAdminTargetSlot(), -amount);
  }

  function recoverPlasmaByAdmin(slot, mode = "one"){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    const max = clamp(toInt(pc.plasmaMax || getPlasmaMaxFromPoolStat(pc.pool, state.k)), 1, 99999);
    if(mode === "full"){
      pc.plasmaNow = max;
    }else{
      pc.plasmaNow = clamp(toInt(pc.plasmaNow) + 1, 0, max);
    }
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function recoverTargetPlasmaPlusOne(){
    if(!isAdminRole()) return;
    recoverPlasmaByAdmin(getAdminTargetSlot(), "one");
  }

  function recoverTargetPlasmaFull(){
    if(!isAdminRole()) return;
    recoverPlasmaByAdmin(getAdminTargetSlot(), "full");
  }

  function setPlasmaByAdmin(slot, value){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const pc = ensurePc(slot);
    const max = clamp(toInt(pc.plasmaMax || pc.pool || 1), 1, 99999);
    pc.plasmaNow = clamp(toInt(value), 0, max);
    if(slot === state.activePc) writePcToUI(pc);
    finalizeAdminMutation();
  }

  function adminInspectInventoryAction(slot, action, inventoryId){
    if(!isAdminRole() || !inventoryId) return;
    state.pcs[state.activePc] = readPcFromUI();
    const ok = mutateInventoryLocal(slot, inventoryId, action);
    if(!ok) return;
    if(slot === state.activePc) writePcToUI(state.pcs[slot]);
    finalizeAdminMutation();
  }

  function updatePendingFollowerNpcImagePreview(){
    const preview = $("adminNpcImagePreview");
    if(!preview) return;
    preview.src = pendingFollowerNpcImageDataUrl || makeFollowerPlaceholder("N");
  }

  function clearPendingFollowerNpcImage(){
    pendingFollowerNpcImageDataUrl = "";
    const input = $("adminNpcImageFile");
    if(input) input.value = "";
    updatePendingFollowerNpcImagePreview();
  }

  async function applyPendingFollowerNpcImageFromFile(){
    if(!isAdminRole()){
      alert("관리자만 NPC 이미지를 설정할 수 있습니다.");
      return;
    }
    const input = $("adminNpcImageFile");
    if(!input) return;
    const file = input.files && input.files[0];
    if(!file){
      alert("적용할 이미지 파일을 먼저 선택해주세요.");
      return;
    }
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_FOLLOWER_IMAGE_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 8MB 이하 파일을 사용해주세요.");
      return;
    }
    try{
      const optimized = await optimizeAvatarFileToDataUrl(file);
      pendingFollowerNpcImageDataUrl = sanitizeFollowerImageDataUrl(optimized);
      updatePendingFollowerNpcImagePreview();
      input.value = "";
    }catch(err){
      alert(err && err.message ? err.message : "NPC 이미지 적용에 실패했습니다.");
    }
  }

  function addFollowerNpcByAdmin(){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const list = ensurePartyFollowers();
    if(list.length >= MAX_PARTY_FOLLOWERS){
      alert(`공용 NPC 슬롯은 최대 ${MAX_PARTY_FOLLOWERS}명까지 추가할 수 있습니다.`);
      return;
    }
    const draft = buildFollowerNpcFromAdminForm();
    if(!draft.name){
      alert("NPC 이름을 입력해주세요.");
      return;
    }
    list.push(normalizeFollowerNpc(Object.assign({}, draft, { id: makeId("npc") }), list.length));
    $("adminNpcName").value = "";
    $("adminNpcHp").value = "10";
    $("adminNpcPlasma").value = "5";
    $("adminNpcHunger").value = String(HUNGER_MAX);
    const adminNpcDc = $("adminNpcDc");
    if(adminNpcDc) adminNpcDc.value = String(PLAYER_BASE_DC);
    $("adminNpcHitBonus").value = "0";
    $("adminNpcPowBonus").value = "0";
    $("adminNpcNote").value = "";
    clearPendingFollowerNpcImage();
    finalizeAdminMutation();
  }

  function removeFollowerNpcByAdmin(npcId){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const removedId = safeText(npcId, 60);
    const list = ensurePartyFollowers();
    const before = list.length;
    state.partyFollowers = list.filter((npc) => safeText(npc.id || "", 60) !== removedId);
    if(before === state.partyFollowers.length) return;
    if(safeText(selectedNpcBattleId || "", 60) === removedId){
      selectedNpcBattleId = "";
    }
    state.activeMonsters = ensureActiveMonsters().map((monster, index) => {
      const normalized = normalizeActiveMonster(monster, index);
      if(normalizeMonsterTargetFollowerId(normalized.targetFollowerId) !== removedId){
        return normalized;
      }
      return normalizeActiveMonster(Object.assign({}, normalized, {
        targetFollowerId: "",
        targetPlayerSlot: MONSTER_TARGET_NONE
      }), index);
    });
    state.publishedActiveMonsters = ensurePublishedActiveMonsters().map((monster, index) => {
      const normalized = normalizeActiveMonster(monster, index);
      if(normalizeMonsterTargetFollowerId(normalized.targetFollowerId) !== removedId){
        return normalized;
      }
      return normalizeActiveMonster(Object.assign({}, normalized, {
        targetFollowerId: "",
        targetPlayerSlot: MONSTER_TARGET_NONE
      }), index);
    });
    render();
    saveLocal();
    queueAdminSync(true);
  }

  function adjustFollowerNpcHpByAdmin(npcId, delta){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.hpMax = clamp(toInt(target.hpMax || target.hpNow || 1), 1, 99999);
    target.hpNow = clamp(toInt(target.hpNow) + toInt(delta), 0, target.hpMax);
    finalizeAdminMutation();
  }

  function adjustFollowerNpcPlasmaByAdmin(npcId, delta){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.plasmaMax = clamp(toInt(target.plasmaMax || 1), 1, 99999);
    target.plasmaCap = clamp(toInt(target.plasmaCap || Math.min(2, target.plasmaMax)), 1, target.plasmaMax);
    target.plasmaNow = clamp(toInt(target.plasmaNow) + toInt(delta), 0, target.plasmaMax);
    finalizeAdminMutation();
  }

  function setFollowerNpcPlasmaByAdmin(npcId, value){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.plasmaMax = clamp(toInt(target.plasmaMax || 1), 1, 99999);
    target.plasmaCap = clamp(toInt(target.plasmaCap || Math.min(2, target.plasmaMax)), 1, target.plasmaMax);
    target.plasmaNow = clamp(toInt(value), 0, target.plasmaMax);
    finalizeAdminMutation();
  }

  function setFollowerNpcCombatBonusByAdmin(npcId, options = {}){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    if(Object.prototype.hasOwnProperty.call(options, "dc")){
      target.dc = clamp(toInt(options.dc), 1, 99999);
    }
    if(Object.prototype.hasOwnProperty.call(options, "hitBonus")){
      target.hitBonus = clamp(toInt(options.hitBonus), -99, 99);
    }
    if(Object.prototype.hasOwnProperty.call(options, "powBonus")){
      target.powBonus = clamp(toInt(options.powBonus), -99, 99);
    }
    state.syncVersion = clamp(toInt(state.syncVersion) + 1, 0, 2147483647);
    localSyncVersion = Math.max(localSyncVersion, state.syncVersion);
    render({ skipSync: true });
    saveLocal();
    queueAdminSync(true);
  }

  function adjustFollowerNpcHitBonusByAdmin(npcId, delta){
    if(!isAdminRole()) return;
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    setFollowerNpcCombatBonusByAdmin(npcId, { hitBonus: clamp(toInt(target.hitBonus) + toInt(delta), -99, 99) });
  }

  function adjustFollowerNpcDcByAdmin(npcId, delta){
    if(!isAdminRole()) return;
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    setFollowerNpcCombatBonusByAdmin(npcId, { dc: clamp(toInt(target.dc ?? PLAYER_BASE_DC) + toInt(delta), 1, 99999) });
  }

  function adjustFollowerNpcPowBonusByAdmin(npcId, delta){
    if(!isAdminRole()) return;
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    setFollowerNpcCombatBonusByAdmin(npcId, { powBonus: clamp(toInt(target.powBonus) + toInt(delta), -99, 99) });
  }

  function setFollowerNpcHungerByAdmin(npcId, value){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.hunger = clamp(toInt(value), 0, HUNGER_MAX);
    finalizeAdminMutation();
  }

  function toggleFollowerNpcInjuryByAdmin(npcId, key, delta = 1){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    const map = sanitizeInjuryMap(target.injuryMap || {});
    map[key] = applyInjuryStep(map[key], delta);
    target.injuryMap = map;
    finalizeAdminMutation();
  }

  function clearFollowerNpcInjuryByAdmin(npcId){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.injuryMap = createEmptyInjuryMap();
    finalizeAdminMutation();
  }

  async function applyFollowerNpcImageByAdmin(npcId, file){
    if(!isAdminRole()) return;
    if(!file) return;
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_FOLLOWER_IMAGE_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 8MB 이하 파일을 사용해주세요.");
      return;
    }
    try{
      const optimized = await optimizeAvatarFileToDataUrl(file);
      state.pcs[state.activePc] = readPcFromUI();
      const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
      if(!target) return;
      target.image = sanitizeFollowerImageDataUrl(optimized);
      finalizeAdminMutation();
    }catch(err){
      alert(err && err.message ? err.message : "NPC 이미지 적용에 실패했습니다.");
    }
  }

  function clearFollowerNpcImageByAdmin(npcId){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();
    const target = ensurePartyFollowers().find((npc) => npc.id === safeText(npcId, 60));
    if(!target) return;
    target.image = "";
    finalizeAdminMutation();
  }

  function renderUserFollowers(){
    const wrap = $("userNpcList");
    if(!wrap) return;
    const list = ensurePartyFollowers();
    const admin = isAdminRole();
    // The side drawer should stay readable; admin editing is handled in the main PC/NPC panels.
    const allowDrawerNpcAdminControls = false;
    if(list.length === 0){
      wrap.innerHTML = '<div class="muted">동행 NPC가 없습니다.</div>';
      return;
    }
    wrap.innerHTML = "";
    for(const npc of list){
      const card = document.createElement("div");
      card.className = "box";
      card.style.marginTop = "8px";

      const row = document.createElement("div");
      row.className = "listRow";
      const left = document.createElement("div");
      left.className = "listText";
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "8px";
      const image = document.createElement("img");
      image.className = "monsterThumb";
      image.alt = `${npc.name} 이미지`;
      image.src = getFollowerImageSrc(npc);
      image.loading = "lazy";
      image.decoding = "async";
      left.appendChild(image);
      const textWrap = document.createElement("div");
      textWrap.style.whiteSpace = "pre-line";
      const note = safeText(npc.note || "", 120);
      textWrap.textContent = `${npc.name} | HP ${npc.hpNow}/${npc.hpMax} | DC ${clamp(toInt(npc.dc ?? PLAYER_BASE_DC), 1, 99999)} | PL ${toInt(npc.plasmaNow)}/${clamp(toInt(npc.plasmaMax), 1, 99999)} | 허기 ${clamp(toInt(npc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX)}/${HUNGER_MAX} | 적중 ${formatSignedNumber(npc.hitBonus)} | 위력 ${formatSignedNumber(npc.powBonus)}${note ? `\n${note}` : ""}`;
      left.appendChild(textWrap);
      row.appendChild(left);

      if(admin && allowDrawerNpcAdminControls){
        const right = document.createElement("div");
        right.className = "listActions";

        const hpDownBtn = document.createElement("button");
        hpDownBtn.type = "button";
        hpDownBtn.textContent = "HP -1";
        hpDownBtn.addEventListener("click", () => adjustFollowerNpcHpByAdmin(npc.id, -1));
        right.appendChild(hpDownBtn);

        const hpUpBtn = document.createElement("button");
        hpUpBtn.type = "button";
        hpUpBtn.textContent = "HP +1";
        hpUpBtn.addEventListener("click", () => adjustFollowerNpcHpByAdmin(npc.id, 1));
        right.appendChild(hpUpBtn);

        const plasmaDownBtn = document.createElement("button");
        plasmaDownBtn.type = "button";
        plasmaDownBtn.textContent = "PL -1";
        plasmaDownBtn.addEventListener("click", () => adjustFollowerNpcPlasmaByAdmin(npc.id, -1));
        right.appendChild(plasmaDownBtn);

        const plasmaUpBtn = document.createElement("button");
        plasmaUpBtn.type = "button";
        plasmaUpBtn.textContent = "PL +1";
        plasmaUpBtn.addEventListener("click", () => adjustFollowerNpcPlasmaByAdmin(npc.id, 1));
        right.appendChild(plasmaUpBtn);

        row.appendChild(right);
      }

      card.appendChild(row);

      const orbWrap = document.createElement("div");
      orbWrap.className = "plasmaOrbs";
      orbWrap.style.marginTop = "8px";
      const plasmaMax = clamp(toInt(npc.plasmaMax), 1, 99999);
      const plasmaNow = clamp(toInt(npc.plasmaNow), 0, plasmaMax);
      const visibleMax = Math.min(plasmaMax, 32);
      for(let i = 0; i < visibleMax; i += 1){
        const orb = document.createElement("span");
        orb.className = `plasmaOrb ${i < plasmaNow ? "on" : ""}`;
        orb.title = `${npc.name} PL ${i + 1}/${plasmaMax}`;
        if(admin && allowDrawerNpcAdminControls){
          orb.style.cursor = "pointer";
          orb.addEventListener("click", () => setFollowerNpcPlasmaByAdmin(npc.id, i + 1));
          orb.addEventListener("contextmenu", (ev) => {
            ev.preventDefault();
            setFollowerNpcPlasmaByAdmin(npc.id, i);
          });
        }
        orbWrap.appendChild(orb);
      }
      if(plasmaMax > visibleMax){
        const more = document.createElement("span");
        more.className = "small";
        more.textContent = `+${plasmaMax - visibleMax}`;
        orbWrap.appendChild(more);
      }
      card.appendChild(orbWrap);

      if(InjuryBodyMap && typeof InjuryBodyMap.renderBoard === "function"){
        const injuryWrap = document.createElement("div");
        injuryWrap.className = "injuryBoardWrap npcInlineInjuryBoard";
        injuryWrap.style.marginTop = "8px";
        InjuryBodyMap.renderBoard(injuryWrap, npc.injuryMap || {}, {
          readOnly: !(admin && allowDrawerNpcAdminControls),
          onToggle: (admin && allowDrawerNpcAdminControls) ? (key) => toggleFollowerNpcInjuryByAdmin(npc.id, key, 1) : null,
          onToggleDetail: (admin && allowDrawerNpcAdminControls) ? (key, delta) => toggleFollowerNpcInjuryByAdmin(npc.id, key, delta) : null,
          onReset: (admin && allowDrawerNpcAdminControls) ? () => clearFollowerNpcInjuryByAdmin(npc.id) : null
        });
        card.appendChild(injuryWrap);
      }

      if(admin && allowDrawerNpcAdminControls){
        const help = document.createElement("div");
        help.className = "small muted";
        help.style.marginTop = "6px";
        help.textContent = "PL 오브: 좌클릭 설정 / 우클릭 감소, 부위: 좌클릭 증가 / 우클릭 감소";
        card.appendChild(help);
      }

      wrap.appendChild(card);
    }
  }

  function renderAdminFollowerList(){
    const wrap = $("adminInspectNpcList");
    if(!wrap) return;
    const list = ensurePartyFollowers();
    if(list.length === 0){
      wrap.innerHTML = '<div class="muted">등록된 동행 NPC가 없습니다.</div>';
      return;
    }
    wrap.innerHTML = "";
    for(const npc of list){
      const row = document.createElement("div");
      row.className = "listRow";
      const left = document.createElement("div");
      left.className = "listText";
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "8px";
      const image = document.createElement("img");
      image.className = "monsterThumb";
      image.alt = `${npc.name} 이미지`;
      image.src = getFollowerImageSrc(npc);
      image.loading = "lazy";
      image.decoding = "async";
      left.appendChild(image);
      const textWrap = document.createElement("div");
      textWrap.style.whiteSpace = "pre-line";
      textWrap.textContent = `${npc.name} | HP ${npc.hpNow}/${npc.hpMax} | DC ${clamp(toInt(npc.dc ?? PLAYER_BASE_DC), 1, 99999)} | PL ${toInt(npc.plasmaNow)}/${clamp(toInt(npc.plasmaMax), 1, 99999)} | 허기 ${clamp(toInt(npc.hunger ?? HUNGER_MAX), 0, HUNGER_MAX)}/${HUNGER_MAX} | 적중 ${formatSignedNumber(npc.hitBonus)} | 위력 ${formatSignedNumber(npc.powBonus)}${npc.note ? `\n${npc.note}` : ""}`;
      left.appendChild(textWrap);

      const right = document.createElement("div");
      right.className = "listActions";

      const imageInput = document.createElement("input");
      imageInput.type = "file";
      imageInput.accept = "image/*";
      imageInput.style.maxWidth = "180px";
      const imageApplyBtn = document.createElement("button");
      imageApplyBtn.type = "button";
      imageApplyBtn.textContent = "이미지 적용";
      imageApplyBtn.addEventListener("click", async () => {
        if(!imageInput.files || !imageInput.files[0]) return;
        await applyFollowerNpcImageByAdmin(npc.id, imageInput.files[0]);
        imageInput.value = "";
      });
      const imageClearBtn = document.createElement("button");
      imageClearBtn.type = "button";
      imageClearBtn.textContent = "이미지 삭제";
      imageClearBtn.addEventListener("click", () => clearFollowerNpcImageByAdmin(npc.id));

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.textContent = "HP -1";
      downBtn.addEventListener("click", () => adjustFollowerNpcHpByAdmin(npc.id, -1));
      right.appendChild(downBtn);

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.textContent = "HP +1";
      upBtn.addEventListener("click", () => adjustFollowerNpcHpByAdmin(npc.id, 1));
      right.appendChild(upBtn);

      const plasmaDownBtn = document.createElement("button");
      plasmaDownBtn.type = "button";
      plasmaDownBtn.textContent = "PL -1";
      plasmaDownBtn.addEventListener("click", () => adjustFollowerNpcPlasmaByAdmin(npc.id, -1));
      right.appendChild(plasmaDownBtn);

      const plasmaUpBtn = document.createElement("button");
      plasmaUpBtn.type = "button";
      plasmaUpBtn.textContent = "PL +1";
      plasmaUpBtn.addEventListener("click", () => adjustFollowerNpcPlasmaByAdmin(npc.id, 1));
      right.appendChild(plasmaUpBtn);

      const dcDownBtn = document.createElement("button");
      dcDownBtn.type = "button";
      dcDownBtn.textContent = "DC -1";
      dcDownBtn.addEventListener("click", () => adjustFollowerNpcDcByAdmin(npc.id, -1));
      right.appendChild(dcDownBtn);

      const dcUpBtn = document.createElement("button");
      dcUpBtn.type = "button";
      dcUpBtn.textContent = "DC +1";
      dcUpBtn.addEventListener("click", () => adjustFollowerNpcDcByAdmin(npc.id, 1));
      right.appendChild(dcUpBtn);

      const hitDownBtn = document.createElement("button");
      hitDownBtn.type = "button";
      hitDownBtn.textContent = "적중 -1";
      hitDownBtn.addEventListener("click", () => adjustFollowerNpcHitBonusByAdmin(npc.id, -1));
      right.appendChild(hitDownBtn);

      const hitUpBtn = document.createElement("button");
      hitUpBtn.type = "button";
      hitUpBtn.textContent = "적중 +1";
      hitUpBtn.addEventListener("click", () => adjustFollowerNpcHitBonusByAdmin(npc.id, 1));
      right.appendChild(hitUpBtn);

      const powDownBtn = document.createElement("button");
      powDownBtn.type = "button";
      powDownBtn.textContent = "위력 -1";
      powDownBtn.addEventListener("click", () => adjustFollowerNpcPowBonusByAdmin(npc.id, -1));
      right.appendChild(powDownBtn);

      const powUpBtn = document.createElement("button");
      powUpBtn.type = "button";
      powUpBtn.textContent = "위력 +1";
      powUpBtn.addEventListener("click", () => adjustFollowerNpcPowBonusByAdmin(npc.id, 1));
      right.appendChild(powUpBtn);

      const saveTemplateBtn = document.createElement("button");
      saveTemplateBtn.type = "button";
      saveTemplateBtn.textContent = "템플릿 저장";
      saveTemplateBtn.addEventListener("click", () => saveFollowerNpcAsTemplate(npc.id));
      right.appendChild(saveTemplateBtn);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "삭제";
      removeBtn.addEventListener("click", () => removeFollowerNpcByAdmin(npc.id));
      right.appendChild(removeBtn);
      right.appendChild(imageInput);
      right.appendChild(imageApplyBtn);
      right.appendChild(imageClearBtn);

      const injuryWrap = document.createElement("div");
      injuryWrap.className = "injuryBoardWrap npcInlineInjuryBoard";
      InjuryBodyMap.renderBoard(injuryWrap, npc.injuryMap || {}, {
        readOnly: false,
        onToggle: (key) => toggleFollowerNpcInjuryByAdmin(npc.id, key, 1),
        onToggleDetail: (key, delta) => toggleFollowerNpcInjuryByAdmin(npc.id, key, delta),
        onReset: () => clearFollowerNpcInjuryByAdmin(npc.id)
      });

      row.appendChild(left);
      row.appendChild(right);
      row.appendChild(injuryWrap);
      wrap.appendChild(row);
    }
  }

  function addGoldToInspectTarget(){
    if(!isAdminRole()) return;
    const amount = clamp(toInt($("adminInspectGoldAmount").value), 1, 999999999);
    adjustGoldByAdmin(getAdminInspectSlot(), amount);
  }

  function subGoldFromInspectTarget(){
    if(!isAdminRole()) return;
    const amount = clamp(toInt($("adminInspectGoldAmount").value), 1, 999999999);
    adjustGoldByAdmin(getAdminInspectSlot(), -amount);
  }

  function renderAdminInspectPanel(){
    const panel = $("adminInspectPanel");
    if(!panel) return;

    const slot = getAdminInspectSlot();
    const pc = ensurePc(slot);
    $("adminInspectGold").textContent = String(clamp(toInt(pc.gold), 0, 999999999));

    const wrap = $("adminInspectInventory");
    const list = (Array.isArray(pc.inventory) ? pc.inventory : []).slice().sort(compareInventoryItems);
    if(list.length === 0){
      wrap.innerHTML = '<div class="muted">해당 플레이어 인벤토리가 비어 있습니다.</div>';
    }else{
      wrap.innerHTML = "";
      for(const item of list){
        const row = document.createElement("div");
        row.className = "listRow";

        const left = document.createElement("div");
        left.className = "listText";
        left.style.whiteSpace = "pre-line";
        left.textContent = formatItemLine(item, item.qty);

        const right = document.createElement("div");
        right.className = "listActions";

        if(item.type === "consumable"){
          const consumeBtn = document.createElement("button");
          consumeBtn.type = "button";
          consumeBtn.textContent = "차감(-1)";
          consumeBtn.addEventListener("click", () => adminInspectInventoryAction(slot, "consume", item.id));
          right.appendChild(consumeBtn);
        }

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "삭제";
        removeBtn.addEventListener("click", () => adminInspectInventoryAction(slot, "remove", item.id));
        right.appendChild(removeBtn);

        row.appendChild(left);
        row.appendChild(right);
        wrap.appendChild(row);
      }
    }
    renderAdminFollowerList();
    renderAdminStatusEditor(slot);
  }

  function getRoomId(){
    const room = normalizeRoomId($("roomId").value);
    $("roomId").value = room;
    return room;
  }

  function setNetStatus(text, tone = "warn"){
    const el = $("netStatus");
    el.textContent = text;
    el.className = `status ${tone}`;
  }

  function setPresence(clients){
    if(!Array.isArray(clients) || clients.length === 0){
      $("presenceInfo").textContent = "접속자: -";
      return;
    }
    const list = clients.map((client) => {
      if(client.role === "admin") return "관리자";
      return `User${toInt(client.userSlot) + 1}`;
    });
    $("presenceInfo").textContent = `접속자: ${list.join(", ")}`;
  }

  function queueAdminSync(immediate = false, options = {}){
    const force = !!(options && options.force);
    if(isApplyingRemote || !isAdminRole()) return;
    if(!socket || !socket.connected){
      pendingAdminSyncAfterJoin = true;
      return;
    }
    if(awaitingRoomState && !force){
      pendingAdminSyncAfterJoin = true;
      return;
    }

    const send = () => {
      state.k = readKFromUI();
      state.pcs[state.activePc] = readPcFromUI();
      state.dc = toInt($("dc").value);
      state.enemyEva = toInt($("enemyEva").value);
      state.showDcToUsers = !!($("showDcToUsers") && $("showDcToUsers").checked);
      state.theme = readThemeFromUI();
      state.diceAppearance = readDiceAppearanceFromUI();
      let baseVersion = Math.max(
        clamp(toInt(state.syncVersion), 0, 2147483647),
        clamp(toInt(localSyncVersion), 0, 2147483647)
      );
      if(force){
        // Force push from local snapshot should beat unknown server version too.
        baseVersion = Math.max(baseVersion, clamp(toInt(Math.floor(Date.now() / 1000)), 0, 2147483646));
      }
      state.syncVersion = clamp(baseVersion + 1, 0, 2147483647);
      localSyncVersion = state.syncVersion;
      pendingAdminSyncAfterJoin = false;
      socket.emit("admin_update_state", { roomId: getRoomId(), state });
    };

    if(immediate){
      clearTimeout(syncTimer);
      syncTimer = null;
      send();
      return;
    }

    clearTimeout(syncTimer);
    syncTimer = setTimeout(send, 120);
  }

  function hydrateFromState(next, options = {}){
    const previousActivePc = clamp(toInt(state && state.activePc), 0, MAX_PLAYERS - 1);
    state = normalizeStateShape(mergeIncomingMonsterFieldsWithLocal(next, state));
    localSyncVersion = Math.max(localSyncVersion, clamp(toInt(state.syncVersion), 0, 2147483647));
    writeKToUI(state.k);
    $("dc").value = state.dc;
    $("enemyEva").value = state.enemyEva;
    if($("showDcToUsers")) $("showDcToUsers").checked = !!state.showDcToUsers;
    writeThemeToUI(state.theme);
    applyTheme(state.theme);
    writeDiceAppearanceToUI(state.diceAppearance);

    const preserveAdminActivePc = !!(options && options.preserveAdminActivePc);
    const roleFocusedPc = isAdminRole()
      ? (preserveAdminActivePc ? previousActivePc : state.activePc)
      : getUserSlot();
    state.activePc = clamp(toInt(roleFocusedPc), 0, MAX_PLAYERS - 1);
    adminLastActivePc = clamp(toInt(state.activePc), 0, MAX_PLAYERS - 1);
    updateActiveIndicators();
    writePcToUI(state.pcs[state.activePc]);
    render({ skipSync: !!options.skipSync });
  }

  function applyRemoteState(next, options = {}){
    const force = !!(options && options.force);
    const incoming = normalizeStateShape(mergeIncomingMonsterFieldsWithLocal(next, state));
    const incomingSyncVersion = clamp(toInt(incoming.syncVersion), 0, 2147483647);
    if(!force && incomingSyncVersion > 0 && incomingSyncVersion < localSyncVersion){
      return;
    }
    if(force){
      localSyncVersion = incomingSyncVersion;
    }
    if(!isAdminRole() && pendingUserActionSync){
      const userSlot = getUserSlot();
      if(pendingUserActionSync.userSlot !== userSlot){
        pendingUserActionSync = null;
      }else{
        const incomingPc = incoming.pcs[userSlot];
        if(!incomingPc){
          pendingUserActionSync = null;
        }else{
          const incomingActionState = readUserActionStateForSync(incomingPc, incoming.k);
          const incomingSignature = getActionStateSignature(incomingActionState);
          if(incomingSignature === pendingUserActionSync.signature){
            pendingUserActionSync = null;
          }else if(Date.now() < pendingUserActionSync.expiresAt){
            applyActionStateToPc(incomingPc, pendingUserActionSync.actionState, incoming.k);
          }else{
            pendingUserActionSync = null;
          }
        }
      }
    }
    isApplyingRemote = true;
    hydrateFromState(incoming, { skipSync: true, preserveAdminActivePc: true });
    isApplyingRemote = false;
  }

  function emitJoinRoom(){
    if(!socket || !socket.connected) return;
    awaitingRoomState = true;
    socket.emit("join_room", {
      roomId: getRoomId(),
      role: getRole(),
      userSlot: getUserSlot()
    });
  }

  function ensureSocket(){
    if(socket) return;
    if(typeof io !== "function"){
      setNetStatus("socket.io 로드 실패", "bad");
      return;
    }

    const inviteToken = getInviteToken();
    socket = io({
      autoConnect: false,
      auth: inviteToken ? { inviteToken } : {}
    });

    socket.on("connect", () => {
      setNetStatus(`연결됨 (${socket.id.slice(0, 6)})`, "good");
      emitJoinRoom();
    });

    socket.on("disconnect", () => {
      setNetStatus("연결 끊김", "bad");
      setPresence([]);
      if(isAdminRole()){
        pendingAdminSyncAfterJoin = true;
      }
      awaitingRoomState = false;
      joinedRoomId = "";
      pendingUserActionSync = null;
      rollSyncPending.clear();
      rollSyncSeen.clear();
      rollSyncQueue = Promise.resolve();
    });

    socket.on("connect_error", (err) => {
      const message = safeText(err && err.message ? err.message : "", 120);
      if(message === "INVITE_REQUIRED"){
        setNetStatus("초대 링크 인증 실패", "bad");
        return;
      }
      setNetStatus("연결 오류", "bad");
    });

    socket.on("room_state", (payload) => {
      if(!payload || !payload.state) return;
      const forceHydrate = awaitingRoomState;
      awaitingRoomState = false;
      joinedRoomId = normalizeRoomId(payload.roomId || getRoomId());
      applyRemoteState(payload.state, { force: forceHydrate });
      if(isAdminRole() && pendingAdminSyncAfterJoin){
        queueAdminSync(true, { force: true });
      }
      if(!isAdminRole() && pendingUserActionSync){
        queueUserActionSync(true);
      }
    });

    socket.on("session_log_append", (payload) => {
      const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : "");
      if(roomId && roomId !== getRoomId()) return;
      if(!payload || !payload.entry) return;
      pushSessionLog(payload.entry, { persist: false, sync: false });
    });

    socket.on("session_logs_clear", (payload) => {
      const roomId = normalizeRoomId(payload && payload.roomId ? payload.roomId : "");
      if(roomId && roomId !== getRoomId()) return;
      state.logs = [];
      renderSessionLogs();
    });

    socket.on("whisper_state", (payload) => {
      const logs = payload && Array.isArray(payload.logs) ? payload.logs : [];
      setWhisperLogs(logs);
    });

    socket.on("client_meta", (payload) => {
      clientIdentityKey = safeText(payload && payload.clientKey ? payload.clientKey : "", 120);
      if(adminSessionUnlocked){
        saveAdminSessionCache();
        return;
      }
      if(tryRestoreAdminSessionUnlock()){
        saveAdminSessionCache();
      }
    });

    socket.on("presence_update", (payload) => {
      setPresence(payload && payload.clients ? payload.clients : []);
    });

    socket.on("server_notice", (payload) => {
      const level = payload && payload.level ? payload.level : "warn";
      const message = payload && payload.message ? payload.message : "알림";
      setNetStatus(message, level);
    });

    socket.on("roll_sync", (payload) => {
      handleIncomingRollSync(payload);
    });
  }

  function connectRealtime(){
    syncInviteTokenCacheFromUrl();
    ensureSocket();
    if(!socket) return;
    const inviteToken = getInviteToken();
    socket.auth = inviteToken ? { inviteToken } : {};
    if(socket.connected){
      emitJoinRoom();
      return;
    }
    socket.connect();
    setNetStatus("연결 중...", "warn");
  }

  function disconnectRealtime(){
    if(!socket){
      setNetStatus("오프라인", "warn");
      return;
    }
    if(dice3d && dice3d.frameId){
      cancelAnimationFrame(dice3d.frameId);
      dice3d.frameId = null;
    }
    if(dice3d && dice3d.overlayActive){
      setDiceOverlayActive(false);
    }
    clearHitDiceDisplayHold();
    clearTimeout(userActionSyncTimer);
    userActionSyncTimer = null;
    pendingUserActionSync = null;
    socket.disconnect();
    socket = null;
    setNetStatus("오프라인", "warn");
    setPresence([]);
  }

  function setRoleUiState(){
    ensureAdminRoleSelectionAllowed(false);
    const admin = isAdminRole();
    if(admin) pendingUserActionSync = null;
    const gmTitle = $("gmCardTitle");
    const gmDesc = $("gmCardDesc");
    const gmPanelTabs = $("gmPanelTabs");
    const monsterPanelTitle = $("monsterPanelTitle");
    const monsterPanelDesc = $("monsterPanelDesc");
    const monsterAdminControls = $("monsterAdminControls");
    const judgeBasicPanel = $("judgeBasicPanel");
    const realtimePanel = $("realtimePanel");
    const whisperTargetWrap = $("whisperTargetWrap");
    $("userSlotWrap").style.display = admin ? "none" : "";
    if(whisperTargetWrap) whisperTargetWrap.style.display = admin ? "" : "none";
    document.body.classList.toggle("admin-mode", admin);
    document.body.classList.toggle("user-mode", !admin);
    $("adminTools").style.display = admin ? "" : "none";
    $("adminDrawerToggle").style.display = admin ? "" : "none";
    $("adminInspectPanel").style.display = admin ? "" : "none";
    if(judgeBasicPanel) judgeBasicPanel.style.display = admin ? "" : "none";
    if(realtimePanel) realtimePanel.style.display = admin ? "" : "none";
    if(gmTitle) gmTitle.textContent = admin ? "GM 밸런스 계수" : "전투 중 몬스터";
    if(gmDesc){
      gmDesc.style.display = "";
      gmDesc.textContent = admin
        ? "아래 계수는 PC 3명에게 공통 적용됩니다."
        : "플레이어 모드에서는 GM 계수 대신 현재 전투 몬스터 정보가 표시됩니다.";
    }
    if(monsterPanelTitle) monsterPanelTitle.textContent = admin ? "몬스터 운영" : "전투 중인 몬스터";
    if(monsterPanelDesc){
      monsterPanelDesc.textContent = admin
        ? "현재 전투 몬스터를 등록/관리합니다."
        : "현재 플레이어에게 배치된 전투 몬스터 정보입니다. (읽기 전용)";
    }
    if(monsterAdminControls) monsterAdminControls.style.display = admin ? "" : "none";
    if(gmPanelTabs) gmPanelTabs.style.display = admin ? "" : "none";
    setMonsterCategoryOpen(admin ? monsterCategoryOpen : true);
    if(!admin){
      setDrawerOpen("adminDrawer", false);
    }

    const userAllowed = new Set([
      "adminAuthBtn",
      "roleMode",
      "userSlot",
      "roomId",
      "connectBtn",
      "disconnectBtn",
      "chatInput",
      "chatSendBtn",
      "whisperInput",
      "whisperSendBtn",
      "nameInput",
      "applyNameBtn",
      "pointStat",
      "spendPointBtn",
      "attackType",
      "distanceState",
      "attackRangeState",
      "shape",
      "intensity",
      "multi",
      "damageDiceSides",
      "diceSides",
      "rollHitBtn",
      "rollDamageBtn",
      "userMemo",
      "inventoryFilterType",
      "inventoryGiveTarget",
      "userMapOpenBtn",
      "mapViewerCloseBtn",
      "userDrawerToggle",
      "userDrawerClose"
    ]);

    document.querySelectorAll("input,select,textarea,button").forEach((el) => {
      if(admin){
        el.disabled = false;
      }else{
        const allowedForUser = userAllowed.has(el.id) || el.dataset.userAllowed === "1";
        el.disabled = !allowedForUser;
      }
    });

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.style.pointerEvents = admin ? "auto" : "none";
      tab.style.opacity = admin ? "1" : "0.55";
    });

    if(admin){
      const restorePc = clamp(toInt(adminLastActivePc), 0, MAX_PLAYERS - 1);
      if(state.activePc !== restorePc){
        state.activePc = restorePc;
        updateActiveIndicators();
        writePcToUI(state.pcs[state.activePc]);
      }
    }else{
      adminLastActivePc = clamp(toInt(state.activePc), 0, MAX_PLAYERS - 1);
      setActivePc(getUserSlot(), { skipSaveCurrent: true, skipSync: true });
      setDrawerOpen("userDrawer", true);
    }

    if(socket && socket.connected){
      emitJoinRoom();
    }
    syncActionLocks();
    syncDrawerToggleText();
  }

  function render(options = {}){
    if(!options.skipRead){
      state.k = readKFromUI();
      state.pcs[state.activePc] = readPcFromUI();
      state.dc = toInt($("dc").value);
      state.enemyEva = toInt($("enemyEva").value);
      state.showDcToUsers = !!($("showDcToUsers") && $("showDcToUsers").checked);
      state.theme = readThemeFromUI();
      state.diceAppearance = readDiceAppearanceFromUI();
    }
    applyTheme(state.theme);
    if(!isAdminRole()){
      selectedMonsterAttackId = "";
      selectedNpcBattleId = "";
    }
    const selectedNpcBattle = getSelectedNpcBattleActor();
    const selectedNpcBattleName = selectedNpcBattle
      ? (safeText(selectedNpcBattle.name || "동행 NPC", 24) || "동행 NPC")
      : "";

    const result = calc(state.pcs[state.activePc], state.k);
    currentComputed = { finalHit: result.finalHit, finalPow: result.finalPow };
    syncDiceTotalFxFromComputed(result);

    const displayHitBonus = selectedNpcBattle ? clamp(toInt(selectedNpcBattle.hitBonus), -99, 99) : result.finalHit;
    const displayPowBonus = selectedNpcBattle ? clamp(toInt(selectedNpcBattle.powBonus), -99, 99) : result.finalPow;

    $("hitBonus").textContent = (displayHitBonus >= 0 ? "+" : "") + displayHitBonus;
    $("powBonus").textContent = (displayPowBonus >= 0 ? "+" : "") + displayPowBonus;
    $("currentHitMod").textContent = (displayHitBonus >= 0 ? "+" : "") + displayHitBonus;
    $("note").textContent = selectedNpcBattle ? `${selectedNpcBattleName} 전투 보정` : result.note;
    $("skillPointLeft").textContent = String(clamp(toInt(state.pcs[state.activePc].skillPoints), 0, 99999));

    const hitEl = $("hitBonus");
    const powEl = $("powBonus");
    hitEl.className = "v " + (displayHitBonus >= 3 ? "good" : (displayHitBonus >= 1 ? "warn" : (displayHitBonus <= -1 ? "bad" : "warn")));
    powEl.className = "v " + (displayPowBonus >= 3 ? "good" : (displayPowBonus >= 1 ? "warn" : (displayPowBonus <= -1 ? "bad" : "warn")));

    const wrap = $("breakdown");
    wrap.innerHTML = "";
    if(selectedNpcBattle){
      const rows = [
        { k: "NPC 적중 보정", d: displayHitBonus, note: selectedNpcBattleName },
        { k: "NPC 위력 보정", d: displayPowBonus, note: selectedNpcBattleName }
      ];
      for(const it of rows){
        const row = document.createElement("div");
        row.className = "item";
        const left = document.createElement("div");
        left.textContent = it.k + (it.note ? ` | ${it.note}` : "");
        const right = document.createElement("div");
        const delta = toInt(it.d);
        right.textContent = (delta >= 0 ? "+" : "") + delta;
        right.className = "delta " + (delta > 0 ? "good" : (delta < 0 ? "bad" : "warn"));
        row.appendChild(left);
        row.appendChild(right);
        wrap.appendChild(row);
      }
    }else{
      for(const it of result.bd){
        const row = document.createElement("div");
        row.className = "item";

        const left = document.createElement("div");
        left.textContent = it.k + (it.note ? ` | ${it.note}` : "");
        const right = document.createElement("div");
        const delta = ("v" in it) ? it.v : (it.d ?? 0);
        right.textContent = (delta >= 0 ? "+" : "") + delta;
        right.className = "delta " + (delta > 0 ? "good" : (delta < 0 ? "bad" : "warn"));

        row.appendChild(left);
        row.appendChild(right);
        wrap.appendChild(row);
      }
    }

    const selectedMonsterAttack = getSelectedMonsterAttackMonster();
    const selectedMonsterAttackName = selectedMonsterAttack
      ? (getMonsterDisplayNameById(selectedMonsterAttack.id) || safeText(selectedMonsterAttack.name || "몬스터", 80))
      : "";
    const useGmMonsterDamageDice = isAdminRole() && !!selectedMonsterAttack;
    let damageSides = getDiceSides();
    if(!rolling){
      if(useGmMonsterDamageDice){
        setDamageDiceSidesInUi(selectedMonsterAttack.damageDiceSides, { updateDiceShape: false });
      }else{
        autoSelectDamageDiceByAttackType();
      }
      damageSides = getDiceSides();
      const holdHitDice = Date.now() < diceDamageShapeHoldUntil;
      if(ensureDice3dReady() && !holdHitDice){
        setDiceShape(damageSides);
      }
    }
    const targetInfo = getTargetInfoForPc(state.activePc);
    const target = getTargetValue(targetInfo);
    const gmMonsterDefenseInfo = (isAdminRole() && selectedMonsterAttack)
      ? getMonsterAttackDefenseInfo(selectedMonsterAttack)
      : null;
    const targetForBadge = gmMonsterDefenseInfo ? gmMonsterDefenseInfo.dc : target;
    renderTargetBadge(targetForBadge, gmMonsterDefenseInfo ? null : targetInfo);
    if(isAdminRole() && selectedMonsterAttack){
      const compactTargetLabel = gmMonsterDefenseInfo
        ? (safeText(gmMonsterDefenseInfo.label, 32) || "타겟")
        : "타겟 미설정";
      $("sumBadge").textContent = gmMonsterDefenseInfo
        ? `${selectedMonsterAttackName} -> ${compactTargetLabel} DC${gmMonsterDefenseInfo.dc}`
        : `${selectedMonsterAttackName} -> ${compactTargetLabel}`;
    }else if(selectedNpcBattle){
      $("sumBadge").textContent = `${selectedNpcBattleName} | 적중 d20${formatSignedNumber(displayHitBonus)} | 피해 ${getDamageDiceLabel(damageSides)}`;
    }else{
      $("sumBadge").textContent = `${targetInfo.name} | 적중 d20${formatSignedNumber(displayHitBonus)} | 피해 ${getDamageDiceLabel(damageSides)}`;
    }

    $("exportBox").value = JSON.stringify(state, null, 2);
    renderPcTabs();
    updateActiveIndicators();
    renderPlayerCards();
    syncQuickDamageTargetOptions();
    updateSlotSelectLabels();
    syncAdminStatEditor();
    renderTemplateControls();
    renderNpcTemplateControls();
    renderMonsterControls();
    renderMonsterOpsPanel();
    renderPlayerTargetMonsterSelect();
    renderInventory();
    renderUserInventoryMeta();
    renderUserStatusBadges();
    renderUserFollowers();
    renderSessionLogs();
    renderWhisperLogs();
    renderTargetInfo();
    renderUserCombatOverview();
    renderPlasmaHud();
    renderPlasmaSkillBook();
    syncActionLocks();
    renderActionSetupSummary();
    syncActionPresetButtons();
    renderAdminInspectPanel();
    syncDrawerToggleText();

    if(!options.skipSync) queueAdminSync(false);
  }

  function setActivePc(idx, options = {}){
    const nextIndex = clamp(toInt(idx), 0, MAX_PLAYERS - 1);
    if(!options.skipSaveCurrent){
      state.k = readKFromUI();
      state.pcs[state.activePc] = readPcFromUI();
    }
    if(isAdminRole() && selectedMonsterAttackId){
      selectedMonsterAttackId = "";
      lastAutoDamageDiceAttackType = "";
    }
    selectedNpcBattleId = "";
    state.activePc = nextIndex;
    if(isAdminRole()){
      adminLastActivePc = nextIndex;
    }
    updateActiveIndicators();
    writePcToUI(state.pcs[nextIndex]);
    // Slot switching is a view-navigation action. Keep remote state unchanged
    // unless a caller explicitly asks to sync.
    const skipSync = (options && Object.prototype.hasOwnProperty.call(options, "skipSync"))
      ? !!options.skipSync
      : true;
    render({ skipSync });
  }

  function setActiveNpcBattleActor(npcId, options = {}){
    if(!isAdminRole()) return;
    const id = safeText(npcId || "", 60);
    if(!options.skipSaveCurrent){
      state.k = readKFromUI();
      state.pcs[state.activePc] = readPcFromUI();
    }
    if(selectedMonsterAttackId){
      selectedMonsterAttackId = "";
      lastAutoDamageDiceAttackType = "";
    }
    const target = ensurePartyFollowers().find((npc) => safeText(npc.id || "", 60) === id);
    selectedNpcBattleId = target ? id : "";
    updateActiveIndicators();
    const skipSync = (options && Object.prototype.hasOwnProperty.call(options, "skipSync"))
      ? !!options.skipSync
      : true;
    render({ skipSync });
  }

  function resetK(){
    state.k = defaultK();
    writeKToUI(state.k);
  }

  function resetActivePc(){
    const index = state.activePc;
    const oldPc = state.pcs[index] || defaultPC(index);
    state.pcs[index] = Object.assign(defaultPC(index), { name: oldPc.name || `User${index + 1}`, avatar: oldPc.avatar || "" });
    writePcToUI(state.pcs[index]);
  }

  function resetAll(){
    const next = defaultState();
    selectedMonsterAttackId = "";
    for(let i = 0; i < MAX_PLAYERS; i += 1){
      const prev = state.pcs[i] || defaultPC(i);
      next.pcs[i].avatar = prev.avatar || "";
      next.pcs[i].name = prev.name || `User${i + 1}`;
    }
    state = next;
    writeKToUI(state.k);
    $("dc").value = state.dc;
    $("enemyEva").value = state.enemyEva;
    if($("showDcToUsers")) $("showDcToUsers").checked = !!state.showDcToUsers;
    writeThemeToUI(state.theme);
    applyTheme(state.theme);
    writeDiceAppearanceToUI(state.diceAppearance);
    setActivePc(0);
  }

  function resetThemeToDefault(){
    state.theme = defaultTheme();
    writeThemeToUI(state.theme);
    applyTheme(state.theme);
    const imageInput = $("themeImageFile");
    if(imageInput) imageInput.value = "";
    render();
    saveLocal();
    if(isAdminRole()) queueAdminSync(true);
  }

  function makeSafeLocalSnapshot(raw){
    const snapshot = normalizeStateShape(raw);
    snapshot.logs = [];
    return snapshot;
  }

  function makeCompactLocalSnapshot(raw){
    const snapshot = makeSafeLocalSnapshot(raw);
    if(snapshot.theme && typeof snapshot.theme === "object"){
      snapshot.theme.imageDataUrl = "";
    }
    if(Array.isArray(snapshot.pcs)){
      snapshot.pcs = snapshot.pcs.map((pcRaw, idx) => {
        const pc = normalizePc(pcRaw, idx);
        pc.avatar = "";
        return pc;
      });
    }
    const clearImageField = (listRaw) => {
      const list = Array.isArray(listRaw) ? listRaw : [];
      return list.map((entry) => {
        if(!entry || typeof entry !== "object") return entry;
        return Object.assign({}, entry, { image: "" });
      });
    };
    snapshot.partyFollowers = clearImageField(snapshot.partyFollowers);
    snapshot.npcTemplates = clearImageField(snapshot.npcTemplates);
    snapshot.monsterTemplates = clearImageField(snapshot.monsterTemplates);
    snapshot.activeMonsters = clearImageField(snapshot.activeMonsters);
    snapshot.publishedActiveMonsters = clearImageField(snapshot.publishedActiveMonsters);
    return snapshot;
  }

  function notifyLocalSaveFallback(message){
    if(localSaveWarned) return;
    localSaveWarned = true;
    setNetStatus(message, "warn");
  }

  function saveLocal(){
    state.k = readKFromUI();
    state.pcs[state.activePc] = readPcFromUI();
    state.dc = toInt($("dc").value);
    state.enemyEva = toInt($("enemyEva").value);
    state.showDcToUsers = !!($("showDcToUsers") && $("showDcToUsers").checked);
    state.theme = readThemeFromUI();
    state.diceAppearance = readDiceAppearanceFromUI();
    if(localSaveMode === "full"){
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(STORAGE_SAFE_KEY, JSON.stringify(makeSafeLocalSnapshot(state)));
        localSaveWarned = false;
        return;
      }catch(_err){
        localSaveMode = "safe";
        try{ localStorage.removeItem(STORAGE_KEY); }catch(_removeErr){ /* ignore */ }
      }
    }

    if(localSaveMode === "safe"){
      try{
        localStorage.setItem(STORAGE_SAFE_KEY, JSON.stringify(makeSafeLocalSnapshot(state)));
        notifyLocalSaveFallback("로컬 저장이 경량 모드로 전환되었습니다. (로그 등 일부 기록은 기기 저장에서 제외)");
        return;
      }catch(_errSafe){
        localSaveMode = "compact";
      }
    }

    try{
      localStorage.setItem(STORAGE_SAFE_KEY, JSON.stringify(makeCompactLocalSnapshot(state)));
      notifyLocalSaveFallback("로컬 저장 최소 모드 적용: 이미지 데이터는 기기 저장에서 제외됩니다.");
    }catch(_errCompact){
      notifyLocalSaveFallback("로컬 저장 공간이 부족합니다. 설정 > JSON 백업 후 로그 정리를 권장합니다.");
    }
  }

  function loadLocal(){
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_SAFE_KEY);
    if(!raw) return;
    try{
      const parsed = JSON.parse(raw);
      hydrateFromState(parsed, { skipSync: true });
    }catch(_err){
      /* ignore invalid local state */
    }
  }

  function loadLocalAndSyncServer(){
    loadLocal();
    render({ skipSync: true });
    if(isAdminRole() && socket && socket.connected){
      queueAdminSync(true, { force: true });
      setNetStatus("로컬 저장본을 서버에 반영했습니다.", "good");
    }else{
      setNetStatus("로컬 저장본 불러옴 (서버 미반영)", "warn");
    }
  }

  function pushLocalSnapshotToServer(){
    if(!isAdminRole()){
      alert("관리자만 서버 저장을 실행할 수 있습니다.");
      return;
    }
    if(!socket || !socket.connected){
      alert("먼저 실시간 서버에 연결해주세요.");
      return;
    }
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_SAFE_KEY);
    if(!raw){
      alert("업로드할 로컬 저장 데이터가 없습니다.");
      return;
    }
    try{
      const parsed = JSON.parse(raw);
      isApplyingRemote = true;
      hydrateFromState(parsed, { skipSync: true });
      isApplyingRemote = false;
      queueAdminSync(true, { force: true });
      saveLocal();
      setNetStatus("로컬 데이터를 서버에 저장했습니다.", "good");
    }catch(_err){
      isApplyingRemote = false;
      alert("로컬 저장 데이터 파싱에 실패했습니다.");
    }
  }

  function importJson(){
    try{
      const parsed = JSON.parse($("importBox").value);
      hydrateFromState(parsed, { skipSync: false });
      saveLocal();
    }catch(_err){
      alert("JSON 파싱에 실패했습니다.");
    }
  }

  async function copyExport(){
    const text = $("exportBox").value;
    if(navigator.clipboard && navigator.clipboard.writeText){
      try{
        await navigator.clipboard.writeText(text);
        return;
      }catch(_err){
        /* fallback below */
      }
    }
    const ta = $("exportBox");
    ta.focus();
    ta.select();
    document.execCommand("copy");
  }

  function applyHpDelta(delta){
    state.pcs[state.activePc] = readPcFromUI();
    const pc = state.pcs[state.activePc];
    const hpMax = clamp(toInt(pc.hp), 0, 99999);
    pc.hpNow = clamp(toInt(pc.hpNow ?? hpMax) + delta, 0, hpMax);
    writePcToUI(state.pcs[state.activePc]);
    render();
    saveLocal();
  }

  function syncDamageAmountInputs(raw){
    const amount = clamp(toInt(raw), 0, 99999);
    const text = String(amount);
    if($("damageAmount")) $("damageAmount").value = text;
    if($("pcQuickDamageAmount")) $("pcQuickDamageAmount").value = text;
    return amount;
  }

  function syncQuickDamageTargetOptions(){
    const select = $("pcQuickDamageTarget");
    if(!select) return "pc_active";
    const previous = String(select.value || "pc_active");
    select.innerHTML = "";

    const activeSlot = clamp(toInt(state.activePc), 0, MAX_PLAYERS - 1);
    const activePc = ensurePc(activeSlot);
    const activeName = safeText(activePc.name || `User${activeSlot + 1}`, 24) || `User${activeSlot + 1}`;

    const activeOption = document.createElement("option");
    activeOption.value = "pc_active";
    activeOption.textContent = `현재 PC (${activeName})`;
    select.appendChild(activeOption);

    const followers = ensurePartyFollowers();
    for(const npc of followers){
      const option = document.createElement("option");
      option.value = `npc:${npc.id}`;
      option.textContent = `[NPC] ${npc.name}`;
      select.appendChild(option);
    }

    const hasPrevious = Array.from(select.options).some((option) => option.value === previous);
    select.value = hasPrevious ? previous : "pc_active";
    return select.value;
  }

  function applyDamageFromAmount(amountRaw){
    if(!isAdminRole()) return;
    const amount = syncDamageAmountInputs(amountRaw);
    if(amount <= 0) return;
    const targetValue = syncQuickDamageTargetOptions();
    if(String(targetValue).startsWith("npc:")){
      const npcId = safeText(String(targetValue).slice(4), 60);
      if(!npcId) return;
      adjustFollowerNpcHpByAdmin(npcId, -amount);
      return;
    }
    applyHpDelta(-amount);
  }

  function applyDamage(){
    applyDamageFromAmount($("damageAmount").value);
  }

  function applyQuickDamage(){
    applyDamageFromAmount($("pcQuickDamageAmount").value);
  }

  function applyHealFromAmount(amountRaw){
    if(!isAdminRole()) return;
    const amount = syncDamageAmountInputs(amountRaw);
    if(amount <= 0) return;
    const targetValue = syncQuickDamageTargetOptions();
    if(String(targetValue).startsWith("npc:")){
      const npcId = safeText(String(targetValue).slice(4), 60);
      if(!npcId) return;
      adjustFollowerNpcHpByAdmin(npcId, amount);
      return;
    }
    applyHpDelta(amount);
  }

  function applyQuickHeal(){
    applyHealFromAmount($("pcQuickDamageAmount").value);
  }

  function applyHeal(){
    if(!isAdminRole()) return;
    const amount = clamp(toInt($("healAmount").value), 0, 99999);
    if(amount <= 0) return;
    applyHpDelta(amount);
  }

  function spendSkillPoint(){
    const statKey = $("pointStat").value;
    if(!SPENDABLE_STAT_KEYS.includes(statKey)) return;

    if(!isAdminRole()){
      if(!socket || !socket.connected){
      alert("플레이어 포인트 분배는 실시간 연결 후 사용할 수 있습니다.");
        return;
      }
      const mySlot = getUserSlot();
      socket.emit("user_spend_point", { roomId: getRoomId(), userSlot: mySlot, statKey });
      return;
    }

    state.pcs[state.activePc] = readPcFromUI();
    const pc = state.pcs[state.activePc];
    const points = clamp(toInt(pc.skillPoints), 0, 99999);
    if(points <= 0){
      alert("남은 스킬 포인트가 없습니다.");
      return;
    }

    pc[statKey] = clamp(toInt(pc[statKey]) + 1, 0, 99999);
    if(statKey === "hp"){
      pc.hpNow = clamp(toInt(pc.hpNow ?? pc.hp), 0, pc.hp);
    }
    pc.skillPoints = points - 1;
    writePcToUI(pc);
    render();
    saveLocal();
  }

  function grantSkillPoints(){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();

    const slot = getAdminTargetSlot();
    const amount = clamp(toInt($("grantPointsAmount").value), 0, 99999);
    if(amount <= 0) return;

    state.pcs[slot].skillPoints = clamp(toInt(state.pcs[slot].skillPoints) + amount, 0, 99999);
    if(slot === state.activePc) writePcToUI(state.pcs[slot]);
    render();
    saveLocal();
  }

  function setAdminStatValue(){
    if(!isAdminRole()) return;
    state.pcs[state.activePc] = readPcFromUI();

    const slot = getAdminTargetSlot();
    const statKey = $("adminStatName").value;
    if(!ADMIN_STAT_KEYS.includes(statKey)) return;

    const pc = ensurePc(slot);
    const bounds = getAdminStatBounds(statKey, pc);
    const value = clamp(toInt($("adminStatValue").value), bounds.min, bounds.max);

    if(statKey === "pool"){
      pc.pool = value;
      pc.plasmaMax = getPlasmaMaxFromPoolStat(value, state.k);
      pc.plasmaCap = getEffectivePlasmaCap(pc, getStatStep(state.k));
      pc.plasmaNow = clamp(toInt(pc.plasmaNow), 0, pc.plasmaMax);
      pc.multi = clamp(toInt(pc.multi || 1), 1, getEffectivePlasmaCap(pc, getStatStep(state.k)));
    }else if(statKey === "plasmaCap"){
      pc.plasmaCap = getEffectivePlasmaCap(pc, getStatStep(state.k));
      pc.multi = clamp(toInt(pc.multi || 1), 1, getEffectivePlasmaCap(pc, getStatStep(state.k)));
    }else if(statKey === "plasmaNow"){
      pc.plasmaNow = clamp(value, 0, clamp(toInt(pc.plasmaMax), 1, 99999));
    }else{
      pc[statKey] = value;
      if(statKey === "hp"){
        pc.hpNow = clamp(toInt(pc.hpNow ?? pc.hp), 0, pc.hp);
      }
    }

    if(slot === state.activePc) writePcToUI(state.pcs[slot]);
    render();
    saveLocal();
  }

  async function optimizeAvatarFileToDataUrl(file){
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("이미지 파일을 읽지 못했습니다."));
      };
      image.src = url;
    });

    const naturalW = clamp(toInt(img.naturalWidth || img.width), 1, 20000);
    const naturalH = clamp(toInt(img.naturalHeight || img.height), 1, 20000);
    const maxSide = 640;
    let ratio = Math.min(1, maxSide / Math.max(naturalW, naturalH));
    let width = Math.max(1, Math.round(naturalW * ratio));
    let height = Math.max(1, Math.round(naturalH * ratio));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(!ctx) throw new Error("브라우저 캔버스를 초기화하지 못했습니다.");

    let best = "";
    const qualitySteps = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38, 0.3];
    const mimeCandidates = ["image/webp", "image/jpeg"];

    for(let scalePass = 0; scalePass < 8; scalePass += 1){
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for(const mime of mimeCandidates){
        for(const quality of qualitySteps){
          const dataUrl = canvas.toDataURL(mime, quality);
          if(!best || dataUrl.length < best.length) best = dataUrl;
          if(dataUrl.length <= MAX_AVATAR_DATAURL_LEN){
            return dataUrl;
          }
        }
      }

      width = Math.max(80, Math.round(width * 0.78));
      height = Math.max(80, Math.round(height * 0.78));
    }

    if(best && best.length <= MAX_AVATAR_DATAURL_LEN){
      return best;
    }
    throw new Error("이미지가 너무 큽니다. 더 작은 파일을 사용해주세요.");
  }

  async function applyAvatarForSlot(slot){
    if(!isAdminRole()) return;
    const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    const input = $(`avatarFile${idx}`);
    if(!input) return;

    const file = input.files && input.files[0];
    if(!file) return;
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_AVATAR_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 8MB 이하 파일을 사용해주세요.");
      return;
    }

    try{
      const optimized = await optimizeAvatarFileToDataUrl(file);
      state.pcs[idx] = Object.assign(defaultPC(idx), state.pcs[idx] || {});
      state.pcs[idx].avatar = sanitizeAvatarDataUrl(optimized);
      render();
      saveLocal();
      queueAdminSync(true);
    }catch(err){
      alert(err && err.message ? err.message : "이미지 적용에 실패했습니다.");
    }finally{
      input.value = "";
    }
  }

  function clearAvatarForSlot(slot){
    if(!isAdminRole()) return;
    const idx = clamp(toInt(slot), 0, MAX_PLAYERS - 1);
    state.pcs[idx] = Object.assign(defaultPC(idx), state.pcs[idx] || {});
    state.pcs[idx].avatar = "";
    render();
    saveLocal();
    queueAdminSync(true);
  }

  async function optimizeThemeFileToDataUrl(file){
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("이미지 파일을 읽지 못했습니다."));
      };
      image.src = url;
    });

    const naturalW = clamp(toInt(img.naturalWidth || img.width), 1, 30000);
    const naturalH = clamp(toInt(img.naturalHeight || img.height), 1, 30000);
    const maxSide = 1600;
    let ratio = Math.min(1, maxSide / Math.max(naturalW, naturalH));
    let width = Math.max(1, Math.round(naturalW * ratio));
    let height = Math.max(1, Math.round(naturalH * ratio));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if(!ctx) throw new Error("브라우저 캔버스를 초기화하지 못했습니다.");

    let best = "";
    const qualitySteps = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42];
    const mimeCandidates = ["image/webp", "image/jpeg"];

    for(let scalePass = 0; scalePass < 8; scalePass += 1){
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for(const mime of mimeCandidates){
        for(const quality of qualitySteps){
          const dataUrl = canvas.toDataURL(mime, quality);
          if(!best || dataUrl.length < best.length) best = dataUrl;
          if(dataUrl.length <= MAX_THEME_IMAGE_DATAURL_LEN){
            return dataUrl;
          }
        }
      }

      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(320, Math.round(height * 0.82));
    }

    if(best && best.length <= MAX_THEME_IMAGE_DATAURL_LEN){
      return best;
    }
    throw new Error("배경 이미지가 너무 큽니다. 더 작은 파일을 사용해주세요.");
  }

  async function applyThemeImageFromFile(){
    if(!isAdminRole()) return;
    const input = $("themeImageFile");
    if(!input) return;
    const file = input.files && input.files[0];
    if(!file) return;
    if(!String(file.type || "").startsWith("image/")){
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if(file.size > MAX_THEME_IMAGE_FILE_BYTES){
      alert("이미지 원본이 너무 큽니다. 10MB 이하 파일을 사용해주세요.");
      return;
    }

    try{
      const optimized = await optimizeThemeFileToDataUrl(file);
      state.theme = readThemeFromUI();
      state.theme.imageDataUrl = sanitizeThemeImageDataUrl(optimized);
      writeThemeToUI(state.theme);
      render();
      saveLocal();
      if(isAdminRole()) queueAdminSync(true);
    }catch(err){
      alert(err && err.message ? err.message : "배경 이미지 적용에 실패했습니다.");
    }finally{
      input.value = "";
    }
  }

  function resetThemeImageToDefault(){
    if(!isAdminRole()) return;
    state.theme = readThemeFromUI();
    state.theme.imageDataUrl = "";
    writeThemeToUI(state.theme);
    const imageInput = $("themeImageFile");
    if(imageInput) imageInput.value = "";
    render();
    saveLocal();
    if(isAdminRole()) queueAdminSync(true);
  }

  const encounterControlIds = new Set([
    "encounterMode",
    "encounterSharedMonster",
    "encounterSwarmCount",
    "encounterPcMonster0",
    "encounterPcMonster1",
    "encounterPcMonster2"
  ]);
  const deferredThemeInputIds = new Set([
    "themeImageTileW",
    "themeImageTileH"
  ]);
  const actionSyncInputIds = new Set([
    "attackType",
    "distanceState",
    "attackRangeState",
    "shape",
    "intensity",
    "multi",
    "plasmaSkillRange"
  ]);
  document.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", () => {
    if(encounterControlIds.has(el.id)) return;
    if(deferredThemeInputIds.has(el.id)) return;
    if(/^distanceQuick\d+$/.test(String(el.id || ""))) return;
    if(/^attackRangeQuick\d+$/.test(String(el.id || ""))) return;
    if(String(el.type || "").toLowerCase() === "file") return;
    // Color picker drag fires many input events; apply on "change" only to avoid heavy re-render thrash.
    if(String(el.type || "").toLowerCase() === "color") return;
    if(el.id === "chatInput") return;
    if(el.id === "whisperInput") return;
    if(el.id === "pcQuickDamageTarget") return;
    if(el.id === "playerTargetMonsterSelect") return;
    if(el.id === "plasmaSkillName") return;
    if(el.id === "attackType"){
      const type = normalizeAttackType($("attackType").value);
      $("attackType").value = type;
      syncShapeOptionsByType(type);
    }else if(el.id === "shape"){
      const type = normalizeAttackType($("attackType").value);
      $("shape").value = normalizeShapeForType(type, $("shape").value);
    }else if(el.id === "intensity"){
      $("intensity").value = normalizeIntensity($("intensity").value);
    }
    render();
    if(actionSyncInputIds.has(el.id)) queueUserActionSync(false);
  }));
  const pcTabs = $("pcTabs");
  if(pcTabs){
    pcTabs.addEventListener("click", (ev) => {
      const tab = ev.target && ev.target.closest ? ev.target.closest(".tab") : null;
      if(!tab || !pcTabs.contains(tab)) return;
      const npcId = safeText(tab.dataset.npcId || "", 60);
      if(npcId){
        if(!isAdminRole()) return;
        setActiveNpcBattleActor(npcId);
        return;
      }
      const slot = clamp(toInt(tab.dataset.pc), 0, MAX_PLAYERS - 1);
      setActivePc(slot);
    });
  }
  document.querySelectorAll(".playerCard").forEach((card) => card.addEventListener("click", () => {
    if(!isAdminRole()) return;
    setActivePc(toInt(card.dataset.slot));
  }));

  $("saveBtn").addEventListener("click", () => { saveLocal(); render(); });
  $("loadBtn").addEventListener("click", loadLocalAndSyncServer);
  $("resetAllBtn").addEventListener("click", () => { resetAll(); render(); });
  $("themeResetBtn").addEventListener("click", resetThemeToDefault);
  $("themeBrightness").addEventListener("input", () => updateThemeBrightnessLabel($("themeBrightness").value));
  $("themeImageBrightness").addEventListener("input", () => updateThemeImageBrightnessLabel($("themeImageBrightness").value));
  $("themeImageSaturation").addEventListener("input", () => updateThemeImageSaturationLabel($("themeImageSaturation").value));
  $("diceRoughness").addEventListener("input", () => updateDiceRoughnessLabel($("diceRoughness").value));
  $("diceMetalness").addEventListener("input", () => updateDiceMetalnessLabel($("diceMetalness").value));
  $("diceRollDuration").addEventListener("input", () => updateDiceRollDurationLabel($("diceRollDuration").value));
  $("diceRollPower").addEventListener("input", () => updateDiceRollPowerLabel($("diceRollPower").value));
  $("diceAppearanceResetBtn").addEventListener("click", () => {
    state.diceAppearance = defaultDiceAppearance();
    writeDiceAppearanceToUI(state.diceAppearance);
    if(dice3d && dice3d.ready){
      setDiceShape(getDiceSides(), { forceRebuild: true });
      renderDice3d();
    }
    render();
    saveLocal();
    if(isAdminRole()) queueAdminSync(true);
  });
  $("themeImageTileW").addEventListener("change", () => { render(); saveLocal(); if(isAdminRole()) queueAdminSync(true); });
  $("themeImageTileH").addEventListener("change", () => { render(); saveLocal(); if(isAdminRole()) queueAdminSync(true); });
  $("themeImageMode").addEventListener("change", () => { render(); saveLocal(); if(isAdminRole()) queueAdminSync(true); });
  document.querySelectorAll("input[type='color']").forEach((el) => {
    el.addEventListener("change", () => {
      render({ skipSync: true });
      saveLocal();
      if(isAdminRole()) queueAdminSync(true);
    });
  });
  $("themeImageApplyBtn").addEventListener("click", applyThemeImageFromFile);
  $("themeImageDefaultBtn").addEventListener("click", resetThemeImageToDefault);
  $("pcResetBtn").addEventListener("click", () => { resetActivePc(); render(); });
  $("pcQuickDamageBtn").addEventListener("click", applyQuickDamage);
  $("pcQuickHealBtn").addEventListener("click", applyQuickHeal);

  $("importBtn").addEventListener("click", () => { importJson(); render(); });
  $("copyJsonBtn").addEventListener("click", () => { copyExport(); });
  $("refreshExportBtn").addEventListener("click", () => { render(); });

  $("rollHitBtn").addEventListener("click", () => roll("hit"));
  $("rollDamageBtn").addEventListener("click", () => roll("damage"));

  $("connectBtn").addEventListener("click", connectRealtime);
  $("disconnectBtn").addEventListener("click", disconnectRealtime);
  $("whisperSendBtn").addEventListener("click", sendWhisperMessage);
  $("whisperInput").addEventListener("keydown", (ev) => {
    if(ev.key !== "Enter") return;
    ev.preventDefault();
    sendWhisperMessage();
  });
  $("chatSendBtn").addEventListener("click", sendChatMessage);
  $("chatInput").addEventListener("keydown", (ev) => {
    if(ev.key !== "Enter") return;
    ev.preventDefault();
    sendChatMessage();
  });
  $("chatClearBtn").addEventListener("click", clearSessionLogs);
  $("gmPanelTabBalance").addEventListener("click", () => setMonsterCategoryOpen(false));
  $("gmPanelTabMonster").addEventListener("click", () => setMonsterCategoryOpen(true));
  const activeMonsterCreateFromTemplateBtn = $("activeMonsterCreateFromTemplateBtn");
  if(activeMonsterCreateFromTemplateBtn){
    activeMonsterCreateFromTemplateBtn.addEventListener("click", createActiveMonsterFromTemplate);
  }
  const encounterApplyBtn = $("encounterApplyBtn");
  if(encounterApplyBtn){
    encounterApplyBtn.addEventListener("click", applyEncounterToUsers);
  }
  const encounterHideBtn = $("encounterHideBtn");
  if(encounterHideBtn){
    encounterHideBtn.addEventListener("click", hideEncounterFromUsers);
  }
  const activeMonsterFocusSelect = $("activeMonsterFocusSelect");
  if(activeMonsterFocusSelect){
    activeMonsterFocusSelect.addEventListener("change", () => render({ skipSync: true }));
  }
  $("adminDrawerToggle").addEventListener("click", () => {
    if(!isAdminRole()) return;
    toggleDrawer("adminDrawer");
  });
  $("adminDrawerClose").addEventListener("click", () => setDrawerOpen("adminDrawer", false));
  $("userDrawerToggle").addEventListener("click", () => toggleDrawer("userDrawer"));
  $("userDrawerClose").addEventListener("click", () => setDrawerOpen("userDrawer", false));
  const userMapOpenBtn = $("userMapOpenBtn");
  if(userMapOpenBtn){
    userMapOpenBtn.addEventListener("click", openMapViewer);
  }
  const mapViewerCloseBtn = $("mapViewerCloseBtn");
  if(mapViewerCloseBtn){
    mapViewerCloseBtn.addEventListener("click", () => closeMapViewer({ focusTrigger: true }));
  }
  const mapViewerBackdrop = $("mapViewerBackdrop");
  if(mapViewerBackdrop){
    mapViewerBackdrop.addEventListener("click", () => closeMapViewer({ focusTrigger: false }));
  }
  document.addEventListener("keydown", (ev) => {
    if(ev.key !== "Escape") return;
    if(!isMapViewerOpen()) return;
    ev.preventDefault();
    closeMapViewer({ focusTrigger: true });
  });
  $("inventoryFilterType").addEventListener("change", renderInventory);
  $("inventoryGiveTarget").addEventListener("change", renderInventory);
  $("damageAmount").addEventListener("input", () => syncDamageAmountInputs($("damageAmount").value));
  $("pcQuickDamageAmount").addEventListener("input", () => syncDamageAmountInputs($("pcQuickDamageAmount").value));
  $("applyDamageBtn").addEventListener("click", applyDamage);
  $("applyHealBtn").addEventListener("click", applyHeal);
  $("pushLocalToServerBtn").addEventListener("click", pushLocalSnapshotToServer);
  $("applyNameBtn").addEventListener("click", applyNameChange);
  $("spendPointBtn").addEventListener("click", spendSkillPoint);
  $("grantPointsBtn").addEventListener("click", grantSkillPoints);
  $("adminSetStatBtn").addEventListener("click", setAdminStatValue);
  $("adminPlasmaPlusOneBtn").addEventListener("click", recoverTargetPlasmaPlusOne);
  $("adminPlasmaFullBtn").addEventListener("click", recoverTargetPlasmaFull);
  $("grantGoldBtn").addEventListener("click", grantGoldToTarget);
  $("takeGoldBtn").addEventListener("click", takeGoldFromTarget);
  $("adminCreateItemBtn").addEventListener("click", createItemTemplate);
  $("adminCancelItemEditBtn").addEventListener("click", clearItemTemplateEditor);
  $("adminGrantItemBtn").addEventListener("click", grantSelectedTemplate);
  $("applyMonsterImageBtn").addEventListener("click", applyMonsterTemplateImageFromFile);
  $("clearMonsterImageBtn").addEventListener("click", clearMonsterTemplatePendingImage);
  $("monsterCreateBtn").addEventListener("click", createMonsterTemplate);
  $("monsterCancelEditBtn").addEventListener("click", clearMonsterTemplateEditor);
  const onEncounterChange = () => {
    if(!isAdminRole()) return;
    syncEncounterFromUi();
    render();
    saveLocal();
  };
  $("encounterMode").addEventListener("change", onEncounterChange);
  $("encounterSharedMonster").addEventListener("change", onEncounterChange);
  $("encounterSwarmCount").addEventListener("input", onEncounterChange);
  $("encounterPcMonster0").addEventListener("change", onEncounterChange);
  $("encounterPcMonster1").addEventListener("change", onEncounterChange);
  $("encounterPcMonster2").addEventListener("change", onEncounterChange);
  $("adminTargetSlot").addEventListener("change", syncAdminStatEditor);
  $("adminStatName").addEventListener("change", syncAdminStatEditor);
  $("adminInspectSlot").addEventListener("change", () => render({ skipSync: true }));
  $("adminInspectGoldAddBtn").addEventListener("click", addGoldToInspectTarget);
  $("adminInspectGoldSubBtn").addEventListener("click", subGoldFromInspectTarget);
  $("adminNpcAddBtn").addEventListener("click", addFollowerNpcByAdmin);
  $("adminNpcTemplateSaveBtn").addEventListener("click", saveNpcTemplateFromAdminForm);
  $("adminNpcTemplateApplyBtn").addEventListener("click", applySelectedNpcTemplateToForm);
  $("adminNpcTemplateDeleteBtn").addEventListener("click", removeSelectedNpcTemplate);
  $("adminNpcTemplateSelect").addEventListener("change", applySelectedNpcTemplateToForm);
  $("adminNpcImageApplyBtn").addEventListener("click", applyPendingFollowerNpcImageFromFile);
  $("adminNpcImageClearBtn").addEventListener("click", clearPendingFollowerNpcImage);
  $("adminNpcImageFile").addEventListener("change", () => {
    applyPendingFollowerNpcImageFromFile();
  });
  $("adminClearStatusBtn").addEventListener("click", () => clearStatusEffectsByAdmin(getAdminInspectSlot()));
  $("pc_name").addEventListener("input", () => { $("nameInput").value = $("pc_name").value; });
  $("nameInput").addEventListener("input", () => { $("pc_name").value = $("nameInput").value; });
  const actionModeAttackBtn = $("actionModeAttack");
  const actionModeItemBtn = $("actionModeItem");
  if(actionModeAttackBtn) actionModeAttackBtn.addEventListener("click", () => applyActionPreset("attack"));
  if(actionModeItemBtn) actionModeItemBtn.addEventListener("click", () => applyActionPreset("item"));
  const plasmaSkillSaveBtn = $("plasmaSkillSaveBtn");
  if(plasmaSkillSaveBtn) plasmaSkillSaveBtn.addEventListener("click", saveCurrentAsPlasmaSkill);
  const plasmaSkillKindSelect = $("plasmaSkillKind");
  if(plasmaSkillKindSelect){
    plasmaSkillKindSelect.addEventListener("change", () => {
      syncPlasmaSkillKindUi();
      render({ skipSync: true });
    });
  }
  const plasmaSkillNameInput = $("plasmaSkillName");
  if(plasmaSkillNameInput){
    plasmaSkillNameInput.addEventListener("keydown", (ev) => {
      if(ev.key !== "Enter") return;
      ev.preventDefault();
      saveCurrentAsPlasmaSkill();
    });
  }
  const quickDamageTargetSelect = $("pcQuickDamageTarget");
  if(quickDamageTargetSelect){
    quickDamageTargetSelect.addEventListener("change", () => render({ skipSync: true }));
  }
  const playerTargetMonsterSelect = $("playerTargetMonsterSelect");
  if(playerTargetMonsterSelect){
    playerTargetMonsterSelect.addEventListener("change", () => {
      render({ skipSync: true });
      if(!isAdminRole()) queueUserActionSync(true);
    });
  }
  $("attackType").addEventListener("change", () => {
    const type = normalizeAttackType($("attackType").value);
    $("attackType").value = type;
    syncShapeOptionsByType(type);
    render();
    queueUserActionSync(false);
  });
  $("distanceState").addEventListener("change", () => {
    const value = DISTANCE_KEYS.includes($("distanceState").value) ? $("distanceState").value : "close";
    $("distanceState").value = value;
    render();
    queueUserActionSync(false);
  });
  $("attackRangeState").addEventListener("change", () => {
    const value = String($("attackRangeState").value || "") === "far" ? "far" : "close";
    $("attackRangeState").value = value;
    render();
    queueUserActionSync(false);
  });
  $("shape").addEventListener("change", () => {
    const type = normalizeAttackType($("attackType").value);
    $("shape").value = normalizeShapeForType(type, $("shape").value);
    render();
    queueUserActionSync(false);
  });
  $("intensity").addEventListener("change", () => {
    $("intensity").value = normalizeIntensity($("intensity").value);
    render();
    queueUserActionSync(false);
  });
  $("multi").addEventListener("change", () => {
    render();
    queueUserActionSync(false);
  });
  $("userMemo").addEventListener("input", queueMemoSync);
  $("userMemo").addEventListener("change", queueMemoSync);
  for(let i = 0; i < MAX_PLAYERS; i += 1){
    const applyBtn = $(`applyAvatar${i}`);
    const clearBtn = $(`clearAvatar${i}`);
    const alwaysUpBtn = $(`alwaysUp${i}`);
    const alwaysDownBtn = $(`alwaysDown${i}`);
    const alwaysPowUpBtn = $(`alwaysPowUp${i}`);
    const alwaysPowDownBtn = $(`alwaysPowDown${i}`);
    const distanceQuickSelect = $(`distanceQuick${i}`);
    const attackRangeQuickSelect = $(`attackRangeQuick${i}`);
    if(applyBtn) applyBtn.addEventListener("click", () => applyAvatarForSlot(i));
    if(clearBtn) clearBtn.addEventListener("click", () => clearAvatarForSlot(i));
    if(alwaysUpBtn){
      alwaysUpBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        adjustAlwaysHitByAdmin(i, 1);
      });
    }
    if(alwaysDownBtn){
      alwaysDownBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        adjustAlwaysHitByAdmin(i, -1);
      });
    }
    if(alwaysPowUpBtn){
      alwaysPowUpBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        adjustAlwaysPowByAdmin(i, 1);
      });
    }
    if(alwaysPowDownBtn){
      alwaysPowDownBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        adjustAlwaysPowByAdmin(i, -1);
      });
    }
    if(distanceQuickSelect){
      distanceQuickSelect.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
      });
      distanceQuickSelect.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
      distanceQuickSelect.addEventListener("change", (ev) => {
        ev.stopPropagation();
        setDistanceByAdmin(i, distanceQuickSelect.value);
      });
    }
    if(attackRangeQuickSelect){
      attackRangeQuickSelect.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
      });
      attackRangeQuickSelect.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
      attackRangeQuickSelect.addEventListener("change", (ev) => {
        ev.stopPropagation();
        setAttackRangeByAdmin(i, attackRangeQuickSelect.value);
      });
    }
  }

  $("adminAuthBtn").addEventListener("click", requestAdminSessionUnlock);
  $("roleMode").addEventListener("change", () => {
    if(!ensureAdminRoleSelectionAllowed(true)){
      setRoleUiState();
      render({ skipSync: true });
      return;
    }
    setRoleUiState();
    render({ skipSync: !isAdminRole() });
  });

  $("userSlot").addEventListener("change", () => {
    if(!isAdminRole()){
      setActivePc(getUserSlot(), { skipSaveCurrent: true, skipSync: true });
    }
    if(socket && socket.connected){
      emitJoinRoom();
    }
  });

  $("roomId").addEventListener("change", () => {
    $("roomId").value = normalizeRoomId($("roomId").value);
    if(socket && socket.connected){
      emitJoinRoom();
    }
  });
  window.addEventListener("resize", () => {
    syncDrawerLayoutOffsets();
    resizeDice3d();
  });
  window.addEventListener("scroll", onWindowScroll, { passive: true });

  state = normalizeStateShape(state);
  ensureMonsterTemplateDamageDiceControl();
  ensureAdminNpcDcField();
  repairCorruptedUiText();
  writeKToUI(state.k);
  writeThemeToUI(state.theme);
  applyTheme(state.theme);
  writeDiceAppearanceToUI(state.diceAppearance);
  writePcToUI(state.pcs[0]);
  $("dc").value = state.dc;
  $("enemyEva").value = state.enemyEva;
  if($("showDcToUsers")) $("showDcToUsers").checked = !!state.showDcToUsers;
  setNetStatus("오프라인", "warn");
  setPresence([]);
  syncDrawerToggleText();
  lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  updateHeaderVisibilityByScroll();
  ensureDice3dReady();
  tryRestoreAdminSessionUnlock();

  loadLocal();
  syncDamageAmountInputs($("damageAmount").value);
  render({ skipSync: true });
  repairCorruptedUiText();
  updateMonsterTemplateImagePreview();
  syncMonsterTemplateEditorUi();
  updatePendingFollowerNpcImagePreview();
  setRoleUiState();
