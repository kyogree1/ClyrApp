chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[EXT] MESSAGE RECEIVED:", msg);

  if (msg?.type === "SET_USER") {
    if (!msg.userId) {
      chrome.storage.local.remove("userId");
      return;
    }
    chrome.storage.local.set({ userId: msg.userId });
    return;
  }

  // ✅ INI YANG KURANG SELAMA INI
  if (msg?.type === "RESET_USAGE") {
    console.log("🔥 RESET_USAGE RECEIVED");

    // STOP SESSION
    current = { domain: null, start: null };

    // CLEAR STORAGE
    chrome.storage.local.set({
      usage: {},
      currentState: { domain: null, start: null },
    });

    // RESET CACHE
    cachedToday = 0;
    cachedLimit = 0;
    lastLimitCheck = 0;
    lastUsageCheck = 0;

    console.log("🔥 RESET DONE (BACKGROUND)");
    return;
  }
});

/* ============================================================
   CONFIG
============================================================ */

const SUPABASE_URL = "https://aressqmsufpehhdcdujj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZXNzcW1zdWZwZWhoZGNkdWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDg1MzEsImV4cCI6MjA3OTEyNDUzMX0.1rgsHeKmYArp4kqS7fDv3Zxj4qO81SDwKbzaxqyIkjw";

const USAGE_KEY = "usage";
const STATE_KEY = "currentState";
const USER_KEY = "userId";

const NEGATIVE_DOMAINS = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "redtube.com",
  "youporn.com",
  "twitter.com",
  "reddit.com",
  "if.itk.ac.id",
];

/* ============================================================
   STATE
============================================================ */

let current = { domain: null, start: null };

// Cache Supabase calls (separate timers)
let cachedLimit = 0;
let cachedToday = 0;
let lastLimitCheck = 0;
let lastUsageCheck = 0;

// Prevent race / double events
let inFlight = Promise.resolve();
let pendingDomain = null;

/* ============================================================
   HELPERS
============================================================ */

function getDomain(url) {
  try {
    const u = new URL(url);
    if (["chrome:", "edge:", "about:"].includes(u.protocol)) return null;
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// RPC response sometimes: number, object, or array.
// Normalize to a number safely.
async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toNumber(val) {
  // Examples:
  // - 120
  // - { value: 120 }
  // - [{ value: 120 }] or [{ sum: 120 }] etc
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return 0;
    return toNumber(val[0]);
  }
  if (typeof val === "object") {
    // common keys
    const keys = ["value", "limit", "usage", "sum", "total", "result"];
    for (const k of keys) {
      if (k in val) return toNumber(val[k]);
    }
  }
  return 0;
}

async function loadUsage() {
  const data = await chrome.storage.local.get(USAGE_KEY);
  return data[USAGE_KEY] || {};
}

async function saveUsage(data) {
  return chrome.storage.local.set({ [USAGE_KEY]: data });
}

async function saveState() {
  return chrome.storage.local.set({ [STATE_KEY]: current });
}

async function resetStateAndUsage() {
  console.log("🔥 RESET EXTENSION");

  // 1️⃣ STOP SESSION AKTIF
  current.domain = null;
  current.start = null;

  // 2️⃣ CLEAR STORAGE
  await chrome.storage.local.set({
    usage: {},
    currentState: { domain: null, start: null },
  });

  // 3️⃣ RESET CACHE (PENTING)
  cachedToday = 0;
  cachedLimit = 0;
  lastLimitCheck = 0;
  lastUsageCheck = 0;

  console.log("🔥 RESET DONE");
}

/* ============================================================
   SUPABASE FUNCTIONS (CACHED)
============================================================ */

async function getLimit(userId) {
  const now = Date.now();
  if (now - lastLimitCheck < 8000) return cachedLimit;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_today_limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ uid: userId }),
    });

    const json = await readJsonSafe(res);
    cachedLimit = toNumber(json);
    lastLimitCheck = now;
    return cachedLimit;
  } catch {
    return cachedLimit;
  }
}

async function getTodayUsage(userId) {
  const now = Date.now();
  if (now - lastUsageCheck < 8000) return cachedToday;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_today_usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ uid: userId }),
    });

    const json = await readJsonSafe(res);
    cachedToday = toNumber(json);
    lastUsageCheck = now;
    return cachedToday;
  } catch {
    return cachedToday;
  }
}

/* ============================================================
   SEND LOG
============================================================ */

async function sendToSupabase(domain, seconds) {
  const { userId } = await chrome.storage.local.get(USER_KEY);
  if (!userId) return;

  if (!domain || seconds <= 0) return;

  // keep your original behavior: only log negative domains
  if (!NEGATIVE_DOMAINS.includes(domain)) return;

  console.log(`➡️ SEND LOG: ${domain} = ${seconds}s`);

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        domain,
        duration_seconds: seconds,
      }),
    });
  } catch (e) {
    console.error("Supabase error:", e);
  }
}

/* ============================================================
   MAIN TRACKER
============================================================ */

async function applyActiveDomain(newDomain) {
  const now = Date.now();
  const oldDomain = current.domain;
  const oldStart = current.start;

  const { userId } = await chrome.storage.local.get(USER_KEY);

  // Early stop if limit reached (safe rules)
  if (userId) {
    const today = await getTodayUsage(userId);
    const limit = await getLimit(userId);

    // IMPORTANT: if limit is 0 / null -> treat as "no limit set" (do not stop tracking)
    if (limit > 0 && today >= limit) {
      console.warn("⛔ LIMIT REACHED — STOP TRACKING");

      // Save last session before stopping
      if (oldDomain && oldStart) {
        const elapsed = Math.floor((now - oldStart) / 1000);
        if (elapsed >= 5) await sendToSupabase(oldDomain, elapsed);
      }

      current.domain = null;
      current.start = null;
      await saveState();
      return;
    }
  }

  // Count previous session
  if (oldDomain && oldStart) {
    const elapsed = Math.floor((now - oldStart) / 1000);

    if (elapsed > 0) {
      const usage = await loadUsage();
      if (!usage[oldDomain]) usage[oldDomain] = { seconds: 0, sessions: 0 };

      usage[oldDomain].seconds += elapsed;
      usage[oldDomain].sessions += 1;

      await saveUsage(usage);

      if (elapsed >= 5) {
        await sendToSupabase(oldDomain, elapsed);
      }
    }
  }

  // Set new domain
  current.domain = newDomain;
  current.start = newDomain ? now : null;
  await saveState();
}

// Debounced queue to avoid race conditions from multiple listeners
function setActiveDomain(newDomain) {
  pendingDomain = newDomain;

  // chain tasks; only last pendingDomain will be applied when the chain runs
  inFlight = inFlight
    .catch(() => {}) // swallow previous errors
    .then(async () => {
      const dom = pendingDomain;
      pendingDomain = null;

      // if nothing pending, do nothing
      if (dom === undefined) return;

      await applyActiveDomain(dom);
    });

  return inFlight;
}

/* ============================================================
   EVENTS
============================================================ */

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId).catch(() => null);
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

chrome.tabs.onUpdated.addListener(async (_tabId, change, tab) => {
  // only when active tab changes url
  if (tab?.active && change?.url) {
    await setActiveDomain(getDomain(change.url));
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await setActiveDomain(null);
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

/* ============================================================
   INIT
============================================================ */

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await setActiveDomain(tab ? getDomain(tab.url) : null);
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);



/* END */
