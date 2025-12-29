const USAGE_KEY = "usage";
const STATE_KEY = "currentState";

let usage = {};
let state = { domain: null, start: null };
let ticker = null; // ⛔ kontrol interval

const $ = (id) => document.getElementById(id);
const pad2 = (n) => n.toString().padStart(2, "0");
const fmt = (sec) => `${Math.floor(sec / 60)} m ${pad2(sec % 60)} s`;

/* ===============================
   LOAD DATA
=============================== */
async function loadAll() {
  const d = await chrome.storage.local.get([USAGE_KEY, STATE_KEY]);
  usage = d[USAGE_KEY] || {};
  state = d[STATE_KEY] || { domain: null, start: null };
}

/* ===============================
   SNAPSHOT (UI ONLY)
=============================== */
function snapshot() {
  const snap = {};

  // clone usage
  for (const [domain, obj] of Object.entries(usage)) {
    if (!obj) continue;

    const seconds = Math.max(0, Math.floor(obj.seconds || 0));
    const sessions = obj.sessions || 0;

    if (seconds > 0 || sessions > 0) {
      snap[domain] = { seconds, sessions };
    }
  }

  // realtime delta (UI only)
  if (state.domain && state.start) {
    const delta = Math.floor((Date.now() - state.start) / 1000);
    if (delta > 0) {
      if (!snap[state.domain]) snap[state.domain] = { seconds: 0, sessions: 0 };
      snap[state.domain].seconds += delta;
    }
  }

  return snap;
}

/* ===============================
   RENDER
=============================== */
function render() {
  const container = $("siteList");
  const snap = snapshot();
  const sortBy = $("sortBy").value;

  const domains = Object.entries(snap);
  if (domains.length === 0) {
    container.innerHTML = "";
    $("emptyHint").style.display = "block";
    $("totalTime").textContent = "0 m 00 s";
    return;
  }

  $("emptyHint").style.display = "none";

  const totalSec = domains.reduce((s, v) => s + v[1].seconds, 0);
  $("totalTime").textContent = fmt(totalSec);

  // sorting
  if (sortBy === "time") domains.sort((a, b) => b[1].seconds - a[1].seconds);
  else if (sortBy === "sessions") domains.sort((a, b) => b[1].sessions - a[1].sessions);
  else if (sortBy === "name") domains.sort((a, b) => a[0].localeCompare(b[0]));

  const safeTotal = totalSec || 1;

  container.innerHTML = domains.map(([domain, v]) => {
    const pct = (v.seconds / safeTotal) * 100;
    return `
      <div class="site-item">
        <div class="site-header">
          <span class="site-name">${domain}</span>
          <span class="site-time">${fmt(v.seconds)}</span>
        </div>
        <div class="session-count">
          ${v.sessions} sessions • ${pct.toFixed(1)}%
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>
    `;
  }).join("");
}

/* ===============================
   REALTIME TICKER (UI ONLY)
=============================== */
function startTicker() {
  stopTicker();
  ticker = setInterval(async () => {
    await loadAll();
    render();
  }, 1000);
}

function stopTicker() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

/* ===============================
   STORAGE LISTENER
=============================== */
chrome.storage.onChanged.addListener((chg, area) => {
  if (area !== "local") return;

  if (chg[USAGE_KEY]) usage = chg[USAGE_KEY].newValue || {};
  if (chg[STATE_KEY]) state = chg[STATE_KEY].newValue || { domain: null, start: null };

  render();
});

/* ===============================
   INIT
=============================== */
document.addEventListener("DOMContentLoaded", async () => {
  $("sortBy").addEventListener("change", render);

  await loadAll();
  render();
  startTicker();

  /* ===============================
     RESET BUTTON (FINAL FIX)
  =============================== */
  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all website usage data?")) return;

    // 🔥 KIRIM RESET (TANPA CALLBACK)
    chrome.runtime.sendMessage({ type: "RESET_USAGE" });

    // 🔥 BERSIHKAN STATE POPUP
    usage = {};
    state = { domain: null, start: null };

    // 🔥 RENDER LANGSUNG
    render();

    // 🔥 RELOAD POPUP BIAR BENAR-BENAR CLEAN
    setTimeout(() => {
      window.location.reload();
    }, 100);
  });
});
