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

  function spawnParticle() {
    const GRID = 80;
    const cols = Math.ceil(window.innerWidth / GRID);
    const rows = Math.ceil(window.innerHeight / GRID);

    const el = document.createElement("div");
    el.className = "particle";

    const isHorizontal = Math.random() > 0.5;

    const duration = 2.4 + Math.random() * 0.6;
    const travel = 2000;

    if (isHorizontal) {
      el.classList.add("h");

      const row = Math.floor(Math.random() * rows);
      const y = row * GRID;
      el.style.top = `${y - 3}px`;

      el.style.setProperty("--dx", `${travel}px`);
      el.style.setProperty("--dy", `0px`);
    } else {
      el.classList.add("v");

      const col = Math.floor(Math.random() * cols);
      const x = col * GRID;
      el.style.left = `${x - 3}px`;

      el.style.setProperty("--dx", `0px`);
      el.style.setProperty("--dy", `${travel}px`);
    }

    el.style.opacity = 0.1 + Math.random() * 0.1;

    el.style.animationDuration = `${duration}s`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), duration * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnParticle();

    const next = 120 + Math.random() * 120;
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
