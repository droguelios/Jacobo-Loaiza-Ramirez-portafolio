const app = document.getElementById("app");
const overlay = document.getElementById("kc-overlay");
const nav = document.querySelector("nav");
const sound = new Audio(new URL("../../public/videos/King Crimson Sound Effect.mp3", document.currentScript.src));
sound.volume = 0.6;
let pendingNavigation;
let animationTimer;

function playTransition() {
  clearTimeout(animationTimer);
  overlay.classList.remove("kc-active");
  document.body.classList.remove("kc-shake");
  void overlay.offsetWidth;
  overlay.classList.add("kc-active");
  document.body.classList.add("kc-shake");
  sound.currentTime = 0;
  sound.play().catch(() => {});
  animationTimer = setTimeout(() => {
    overlay.classList.remove("kc-active");
    document.body.classList.remove("kc-shake");
  }, 550);
}

async function loadView(url, pushHistory) {
  pendingNavigation?.abort();
  const request = new AbortController();
  pendingNavigation = request;

  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw new Error("No se pudo cargar la vista");
    const page = new DOMParser().parseFromString(await response.text(), "text/html");
    const content = page.getElementById("app");
    if (!content) throw new Error("La vista no contiene #app");
    if (request.signal.aborted) return;

    if (pushHistory) history.pushState(null, "", url);
    app.replaceChildren(...content.childNodes);
    document.title = page.title;
    window.scrollTo(0, 0);
  } catch {
    if (request.signal.aborted) return;
    if (pushHistory) location.assign(url);
    else location.reload();
  }
}

if (location.protocol !== "file:") {
  // Keep menu links relative to the original document, even after pushState.
  for (const link of nav.querySelectorAll("a[href]")) link.href = link.href;

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (link.href === location.href) {
      pendingNavigation?.abort();
      return;
    }
    playTransition();
    loadView(link.href, true);
  });

  window.addEventListener("popstate", () => loadView(location.href, false));
}
