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
    const width = window.innerWidth;
    const height = window.innerHeight;

    const cols = Math.ceil(width / GRID);
    const rows = Math.ceil(height / GRID);

    const el = document.createElement("div");
    el.className = "particle";

    const isHorizontal = Math.random() > 0.3;
    const dir = Math.random() < 0.8 ? 1 : -1;

    const strong = Math.random() < 0.15;

    const opacity = 0.04 + Math.random() * 0.04;
    // ? 0.1 + Math.random() * 0.1 // rare bright streaks
    // : 0.04 + Math.random() * 0.04; // mostly faint

    const speed = strong
      ? 1400 + Math.random() * 400
      : 700 + Math.random() * 600;

    let duration;

    if (isHorizontal) {
      el.classList.add("h");

      const row = Math.floor(Math.random() * rows);
      const y = row * GRID;

      el.style.top = `${y}px`;

      const startX = dir === 1 ? -300 : width + 300;
      const endX = dir === 1 ? width + 300 : -300;

      const distance = endX - startX;

      el.style.left = `${startX}px`;

      el.style.setProperty("--dx", `${distance}px`);
      el.style.setProperty("--dy", `0px`);

      duration = Math.abs(distance) / speed;

      el.style.animationDuration = `${duration}s`;

      spawnNodeBurstsAlongPath(startX, endX, y, true, duration);
    } else {
      el.classList.add("v");

      const col = Math.floor(Math.random() * cols);
      const x = col * GRID;

      el.style.left = `${x}px`;

      const startY = dir === 1 ? -300 : height + 300;
      const endY = dir === 1 ? height + 300 : -300;

      const distance = endY - startY;

      el.style.top = `${startY}px`;

      el.style.setProperty("--dx", `0px`);
      el.style.setProperty("--dy", `${distance}px`);

      duration = Math.abs(distance) / speed;

      el.style.animationDuration = `${duration}s`;

      spawnNodeBurstsAlongPath(startY, endY, x, false, duration);
    }

    el.style.setProperty("--final-opacity", opacity);
    el.style.animationDuration = `${duration}s`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), duration * 1000);
  }

  function spawnNodeBurstsAlongPath(start, end, fixed, isHorizontal, duration) {
    const GRID = 80;

    const dir = end > start ? 1 : -1;

    const firstNode = Math.ceil(start / GRID) * GRID;

    for (
      let pos = firstNode;
      dir === 1 ? pos <= end : pos >= end;
      pos += GRID * dir
    ) {
      const progress = Math.abs(pos - start) / Math.abs(end - start);
      const delay = progress * duration * 1000;

      setTimeout(() => {
        if (isHorizontal) {
          spawnNodeFlash(pos, fixed);
        } else {
          spawnNodeFlash(fixed, pos);
        }
      }, delay);
    }
  }

  function spawnLoop() {
    if (!running) return;

    spawnParticle();

    const next = 300 + Math.random() * 600;
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
