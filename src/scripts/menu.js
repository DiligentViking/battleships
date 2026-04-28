export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");
  const ambient = document.querySelector(".ambient-bg");

  let running = true;

  function init() {
    root.classList.add("menu-entering");
    ambient.classList.add("menu-active");

    bindButtons();

    setTimeout(() => {
      root.classList.add("menu-awake");
      spawnLoop();
    }, 3000);
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

  function spawnStreak() {
    const GRID = 80;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const cols = Math.ceil(width / GRID);
    const rows = Math.ceil(height / GRID);

    const el = document.createElement("div");
    el.className = "streak";

    const isHorizontal = Math.random() > 0.6;
    const dir = Math.random() < 0.8 ? 1 : -1;

    const strong = Math.random() < 0.15;

    const opacity = 0.03 + Math.random() * 0.03;

    const speed = strong
      ? 1400 + Math.random() * 400
      : 800 + Math.random() * 600;

    let duration;

    if (isHorizontal) {
      el.classList.add("h");

      const row = Math.floor(Math.random() * rows);
      const y = row * GRID;

      el.style.top = `${y}px`;

      const startX = dir === 1 ? -900 : width + 900;
      const endX = dir === 1 ? width + 900 : -900;

      const distance = endX - startX;

      el.style.left = `${startX}px`;

      el.style.setProperty("--dx", `${distance}px`);
      el.style.setProperty("--dy", "0px");

      duration = Math.abs(distance) / speed;
    } else {
      el.classList.add("v");

      const col = Math.floor(Math.random() * cols);
      const x = col * GRID;

      el.style.left = `${x}px`;

      const startY = dir === 1 ? -900 : height + 900;
      const endY = dir === 1 ? height + 900 : -900;

      const distance = endY - startY;

      el.style.top = `${startY}px`;

      el.style.setProperty("--dx", "0px");
      el.style.setProperty("--dy", `${distance}px`);

      duration = Math.abs(distance) / speed;
    }

    el.style.setProperty("--final-opacity", opacity);
    el.style.animationDuration = `${duration}s`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), duration * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnStreak();

    const next = 300 + Math.random() * 500;
    setTimeout(spawnLoop, next);
  }

  function exitMenu() {
    running = false;

    ambient.classList.remove("menu-active");

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}
