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
   DASHBOARD TIMER  (untuk UI & Supabase)
============================================================ */

// Dipanggil tiap 1 detik saat ada domain aktif
async function tick() {
  if (!current.domain || !current.start) return;

  const now = Date.now();
  const delta = Math.floor((now - current.start) / 1000);
  if (delta <= 0) return;          // kurang dari 1 detik, skip

  // geser start ke "sekarang"
  current.start = now;

  // Update usage untuk dashboard
  const usage = await loadUsage();
  if (!usage[current.domain]) {
    usage[current.domain] = { seconds: 0, sessions: 0 };
  }
  usage[current.domain].seconds += delta;

  await saveUsage(usage);
  await saveState();

  // Kirim ke Supabase per detik untuk domain negatif
  if (NEGATIVE_DOMAINS.includes(current.domain)) {
    await sendToSupabase(current.domain, delta);  // biasanya delta = 1
  }
}

function startTicker() {
  if (!tickTimer) {
    tickTimer = setInterval(() => {
      // fire and forget
      tick();
    }, 1000);
  }
}

function stopTicker() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
}

/* ============================================================
   DOMAIN TRACKING (FINAL FIX)
============================================================ */

async function setActiveDomain(newDomain) {
    const oldDomain = current.domain;
    const oldStart = current.start;

    // STEP 1: kirim durasi domain sebelumnya
    if (oldDomain && oldStart) {
        const elapsed = Math.floor((Date.now() - oldStart) / 1000);

        // Kirim ke Supabase hanya untuk NEGATIVE DOMAIN dengan minimal 5 detik
        if (elapsed >= 5 && NEGATIVE_DOMAINS.includes(oldDomain)) {
            console.log(`➡️ SEND: ${oldDomain} = ${elapsed}s`);
            await sendToSupabase(oldDomain, elapsed);
        }
    }

    // STEP 2: update domain baru
    if (newDomain) {
        current.domain = newDomain;
        current.start = Date.now();
    } else {
        current.domain = null;
        current.start = null;
    }

    await chrome.storage.local.set({ currentState: current });
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
    chrome.storage.local.set({ usage: {} }, () => {
      current = { domain: null, start: null };
      stopTicker();
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
