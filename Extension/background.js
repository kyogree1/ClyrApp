console.log("BACKGROUND STARTED (ACTIVE)");

/* ============================================================
   CONFIG
============================================================ */

const SUPABASE_URL = "https://aressqmsufpehhdcdujj.supabase.co";
const SUPABASE_ANON_KEY = "<YOUR_KEY_HERE>";

const USAGE_KEY = "usage";
const STATE_KEY = "currentState";
const USER_KEY = "userId";

const NEGATIVE_DOMAINS = [
  "pornhub.com", "xvideos.com", "xnxx.com",
  "redtube.com", "youporn.com",
  "twitter.com", "reddit.com",
  "if.itk.ac.id"
];

/* ============================================================
   STATE
============================================================ */

let current = { domain: null, start: null };

/* Cache Supabase calls */
let cachedLimit = 0;
let cachedToday = 0;
let lastCheck = 0;

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
  const data = await chrome.storage.local.get(USAGE_KEY);
  return data[USAGE_KEY] || {};
}

async function saveUsage(data) {
  return chrome.storage.local.set({ [USAGE_KEY]: data });
}

async function saveState() {
  return chrome.storage.local.set({ [STATE_KEY]: current });
}

/* ============================================================
   SUPABASE FUNCTIONS (CACHED)
============================================================ */

async function getLimit(userId) {
  const now = Date.now();
  if (now - lastCheck < 8000) return cachedLimit; // 8s cache

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_today_limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ uid: userId })
    });

    cachedLimit = await res.json();
    lastCheck = now;
    return cachedLimit ?? 0;

  } catch {
    return cachedLimit ?? 0;
  }
}

async function getTodayUsage(userId) {
  const now = Date.now();
  if (now - lastCheck < 8000) return cachedToday;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_today_usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ uid: userId })
    });

    cachedToday = await res.json();
    lastCheck = now;
    return cachedToday ?? 0;

  } catch {
    return cachedToday ?? 0;
  }
}

/* ============================================================
   SEND LOG
============================================================ */

async function sendToSupabase(domain, seconds) {
  const { userId } = await chrome.storage.local.get(USER_KEY);
  if (!userId) return;

  if (!domain || seconds <= 0) return;
  if (!NEGATIVE_DOMAINS.includes(domain)) return;

  console.log(`➡️ SEND LOG: ${domain} = ${seconds}s`);

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
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

async function setActiveDomain(newDomain) {
  const now = Date.now();
  const oldDomain = current.domain;
  const oldStart = current.start;

  const { userId } = await chrome.storage.local.get(USER_KEY);

  // Early stop if limit reached
  if (userId) {
    const today = await getTodayUsage(userId);
    const limit = await getLimit(userId);

    if (today >= limit) {
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

      if (elapsed >= 5 && NEGATIVE_DOMAINS.includes(oldDomain)) {
        await sendToSupabase(oldDomain, elapsed);
      }
    }
  }

  // Set new domain
  current.domain = newDomain;
  current.start = newDomain ? now : null;
  await saveState();
}

/* ============================================================
   EVENTS
============================================================ */

chrome.tabs.onActivated.addListener(async info => {
  const tab = await chrome.tabs.get(info.tabId).catch(() => null);
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (tab.active && change.url) {
    await setActiveDomain(getDomain(change.url));
  }
});

chrome.windows.onFocusChanged.addListener(async windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await setActiveDomain(null);
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

/* ============================================================
   AUTO-BLOCKER (MAIN FRAME ONLY)
============================================================ */

chrome.webRequest.onBeforeRequest.addListener(
  async details => {
    const domain = getDomain(details.url);
    if (!NEGATIVE_DOMAINS.includes(domain)) return {};

    const { userId } = await chrome.storage.local.get(USER_KEY);
    if (!userId) return {};

    const today = await getTodayUsage(userId);
    const limit = await getLimit(userId);

    if (today >= limit) {
      console.warn("🚫 BLOCKED:", domain);
      return { redirectUrl: chrome.runtime.getURL("blocked  .html") };
    }

    return {};
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);

/* ============================================================
   INIT
============================================================ */

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await setActiveDomain(tab ? getDomain(tab.url) : null);
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

/* ============================================================
   MESSAGES
============================================================ */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_USER") {
    chrome.storage.local.set({ userId: msg.userId }, () => {
      console.log("[EXT] USER SET:", msg.userId);
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === "RESET_USAGE") {
    chrome.storage.local.set({ [USAGE_KEY]: {}, [STATE_KEY]: { domain: null, start: null }}, () => {
      current = { domain: null, start: null };
      console.log("🔥 Usage reset");
      sendResponse({ ok: true });
    });
    return true;
  }
});

/* END */
