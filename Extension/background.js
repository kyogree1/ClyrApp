console.log("BACKGROUND STARTED (ACTIVE)");

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
   SUPABASE LOGGING
============================================================ */

async function sendToSupabase(domain, seconds) {
  const { userId } = await chrome.storage.local.get(USER_KEY);
  if (!userId) {
    console.warn("[EXT] No userId, skip Supabase");
    return;
  }

  if (!domain || seconds <= 0) return;

  console.log(`➡️ SUPABASE SEND: ${domain} = ${seconds}s`);

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
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
   DOMAIN TRACKING (SOURCE OF TRUTH)
   - Hitung durasi domain lama
   - Update usage
   - Kirim ke Supabase utk NEGATIVE_DOMAINS
   - Set current domain baru
============================================================ */

async function setActiveDomain(newDomain) {
  const now = Date.now();
  const oldDomain = current.domain;
  const oldStart = current.start;

  // 1) Hitung durasi domain sebelumnya
  if (oldDomain && oldStart) {
    const elapsed = Math.floor((now - oldStart) / 1000);

    if (elapsed > 0) {
      // Update usage di storage (untuk dashboard)
      const usage = await loadUsage();
      if (!usage[oldDomain]) {
        usage[oldDomain] = { seconds: 0, sessions: 0 };
      }
      usage[oldDomain].seconds += elapsed;
      usage[oldDomain].sessions += 1;
      await saveUsage(usage);

      // Kirim ke Supabase hanya untuk domain negatif (opsional min 5 detik)
      if (elapsed >= 5 && NEGATIVE_DOMAINS.includes(oldDomain)) {
        await sendToSupabase(oldDomain, elapsed);
      }
    }
  }

  // 2) Set domain baru
  if (newDomain) {
    current.domain = newDomain;
    current.start = now;
  } else {
    current.domain = null;
    current.start = null;
  }

  await saveState();
}

/* ============================================================
   EVENTS
============================================================ */

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId).catch(() => null);
  const domain = tab ? getDomain(tab.url) : null;
  await setActiveDomain(domain);
});

chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (tab.active && change.url) {
    const domain = getDomain(change.url);
    await setActiveDomain(domain);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Jangan reset usage di sini, cukup stop tracking waktu realtime
    await setActiveDomain(null);
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  await setActiveDomain(tab ? getDomain(tab.url) : null);
});

/* ============================================================
   INIT
============================================================ */

async function init() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const domain = tab ? getDomain(tab.url) : null;
  await setActiveDomain(domain);
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

/* ============================================================
   MESSAGES
============================================================ */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RESET_USAGE") {
    chrome.storage.local.set({ [USAGE_KEY]: {}, [STATE_KEY]: { domain: null, start: null } }, () => {
      current = { domain: null, start: null };
      console.log("🔥 Usage reset");
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
});

/* ============================================================
   EXTERNAL MESSAGES (dari web app)
============================================================ */

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_USER") {
    chrome.storage.local.set({ userId: msg.userId }, () => {
      console.log("[EXT] USER STORED (EXTERNAL):", msg.userId);
      sendResponse({ ok: true });
    });
    return true;
  }

  sendResponse({ ok: false });
});
