console.log("BACKGROUND STARTED (ACTIVE)");

/* ============================================================
   CONFIG
============================================================ */

const SUPABASE_URL = "https://aressqmsufpehhdcdujj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZXNzcW1zdWZwZWhoZGNkdWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDg1MzEsImV4cCI6MjA3OTEyNDUzMX0.1rgsHeKmYArp4kqS7fDv3Zxj4qO81SDwKbzaxqyIkjw";

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
  "if.itk.ac.id"
];

let current = { domain: null, start: null };
let tickTimer = null;

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

async function loadUsage() {
  return (await chrome.storage.local.get(USAGE_KEY))[USAGE_KEY] || {};
}

async function saveUsage(data) {
  return chrome.storage.local.set({ [USAGE_KEY]: data });
}

async function saveState() {
  return chrome.storage.local.set({ [STATE_KEY]: current });
}

/* ============================================================
   TRACKING LOGIC
============================================================ */

async function tick() {
  if (!current.domain || !current.start) return;

  const now = Date.now();
  const delta = Math.floor((now - current.start) / 1000);
  if (delta <= 0) return;

  current.start = now;

  const usage = await loadUsage();
  if (!usage[current.domain]) {
    usage[current.domain] = { seconds: 0, sessions: 0 };
  }

  usage[current.domain].seconds += delta;

  await saveUsage(usage);
  await saveState();
}

function startTicker() {
  if (!tickTimer) {
    tickTimer = setInterval(() => tick(), 1000);
  }
}

function stopTicker() {
  clearInterval(tickTimer);
  tickTimer = null;
}

/* ============================================================
   SUPABASE LOGGING
============================================================ */

async function sendToSupabase(domain, seconds) {
  const { userId } = await chrome.storage.local.get(USER_KEY);
  if (!userId) return;

  await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      user_id: userId,
      domain,
      duration_seconds: seconds
    })
  });
}

/* ============================================================
   SWITCH ACTIVE DOMAIN
============================================================ */

async function setActiveDomain(domain) {
  // LOG LAST DOMAIN
  if (current.domain && current.start) {
    const elapsed = Math.floor((Date.now() - current.start) / 1000);

    if (elapsed > 0 && NEGATIVE_DOMAINS.includes(current.domain)) {
      await sendToSupabase(current.domain, elapsed);
    }
  }

  // SWITCH DOMAIN
  current.domain = domain || null;
  current.start = domain ? Date.now() : null;

  await saveState();

  if (domain) startTicker();
  else stopTicker();
}

/* ============================================================
   EVENTS: TAB & WINDOW
============================================================ */

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId).catch(() => null);
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (tab.active && change.url) {
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

  chrome.alarms.create("flush", { periodInMinutes: 1 });
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "flush") await tick();
});

/* ============================================================
   UNIFIED MESSAGE ROUTER
============================================================ */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[EXT] MESSAGE RECEIVED:", msg);

  // INTERNAL USE ONLY
  if (msg.type === "RESET_USAGE") {
    chrome.storage.local.set({ usage: {} }, () => {
      current = { domain: null, start: null };
      console.log("🔥 Usage data has been reset by user");
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === "SET_USER") {
    chrome.storage.local.set({ userId: msg.userId }, () => {
      console.log("[EXT] USER STORED:", msg.userId);
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === "PING_TEST") {
    sendResponse({ ok: true, msg: "pong" });
    return true;
  }

  sendResponse({ ok: false });
});

/* ============================================================
   EXTERNAL MESSAGE HANDLER (website → extension)
============================================================ */

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  console.log("[EXT-EXTERNAL] MESSAGE:", msg);

  if (msg.type === "SET_USER") {
    chrome.storage.local.set({ userId: msg.userId }, () => {
      console.log("[EXT] USER STORED (EXTERNAL):", msg.userId);
      sendResponse({ ok: true });
    });
    return true;
  }

  sendResponse({ ok: false });
});
