console.log("[CLYR] content.js injected");

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;

  console.log("[CLYR] forwarding to background:", event.data);

  if (event.data.type === "CLYR_SET_USER") {
    chrome.runtime.sendMessage({
      type: "SET_USER",
      userId: event.data.userId,
    });
  }
});
