export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");

  let running = true;

  let particleHorizontal = true;

  function init() {
    spawnLoop();
    bindButtons();
  }

  function bindButtons() {
    root.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;

        if (action === "start" || action === "ai") {
          exitMenu();
          onStart(action);
        }

        if (action === "settings") {
          console.log("Settings not implemented yet");
        }
      });
    });
  }

  function spawnNodeFlash(x, y) {
    const el = document.createElement("div");
    el.className = "node-flash";

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), 600);
  }

  function spawnParticle() {
    const GRID = 80;
    const cols = Math.ceil(window.innerWidth / GRID);
    const rows = Math.ceil(window.innerHeight / GRID);

    const el = document.createElement("div");
    el.className = "particle";

    const isHorizontal = Math.random() > 0.5;

    const strong = Math.random() < 0.15;

    const opacity = strong
      ? 0.1 + Math.random() * 0.1 // rare bright streaks
      : 0.04 + Math.random() * 0.04; // mostly faint

    const duration = strong
      ? 1.2 + Math.random() * 0.6 // fast, punchy
      : 2.5 + Math.random() * 2.5; // slow drift

    const travel = 2000;

    if (isHorizontal) {
      el.classList.add("h");

      const row = Math.floor(Math.random() * rows);
      const y = row * GRID;
      el.style.top = `${y}px`;

      el.style.setProperty("--dx", `${travel}px`);
      el.style.setProperty("--dy", `0px`);

      const shouldFlash = Math.random() < 0.25;
      if (shouldFlash) {
        const col = Math.floor(Math.random() * cols);
        const x = col * GRID;

        // delay so it feels like the streak "hits" it
        const delay = Math.random() * duration * 1000;

        setTimeout(() => {
          spawnNodeFlash(x, y);
        }, delay);
      }
    } else {
      el.classList.add("v");

      const col = Math.floor(Math.random() * cols);
      const x = col * GRID;
      el.style.left = `${x}px`;

      el.style.setProperty("--dx", `0px`);
      el.style.setProperty("--dy", `${travel}px`);

      const shouldFlash = Math.random() < 0.25;
      if (shouldFlash) {
        const row = Math.floor(Math.random() * rows);
        const y = row * GRID;

        const delay = Math.random() * duration * 1000;

        setTimeout(() => {
          spawnNodeFlash(x, y);
        }, delay);
      }
    }

    el.style.setProperty("--final-opacity", opacity);
    el.style.animationDuration = `${duration}s`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), duration * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnParticle();

    const next = 400 + Math.random() * 600;
    setTimeout(spawnLoop, next);
  }

  function exitMenu() {
    running = false;

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}
