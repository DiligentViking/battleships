export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");

  const GRID = 80;

  let running = true;
  let rails = { h: [], v: [] };

  function init() {
    buildGridRails();
    spawnLoop();
    bindButtons();

    window.addEventListener("resize", rebuildGridRails);
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

  function buildGridRails() {
    bg.textContent = "";
    rails = { h: [], v: [] };

    const width = window.innerWidth;
    const height = window.innerHeight;

    const cols = Math.ceil(width / GRID) + 1;
    const rows = Math.ceil(height / GRID) + 1;

    const railLayer = document.createElement("div");
    railLayer.className = "grid-rail-layer";

    for (let row = 0; row < rows; row++) {
      const y = row * GRID;

      const rail = document.createElement("div");
      rail.className = "grid-rail horizontal";
      rail.style.top = `${y}px`;

      railLayer.appendChild(rail);
      rails.h.push(rail);
    }

    for (let col = 0; col < cols; col++) {
      const x = col * GRID;

      const rail = document.createElement("div");
      rail.className = "grid-rail vertical";
      rail.style.left = `${x}px`;

      railLayer.appendChild(rail);
      rails.v.push(rail);
    }

    bg.appendChild(railLayer);
  }

  function rebuildGridRails() {
    buildGridRails();
  }

  function spawnStreak() {
    const isHorizontal = Math.random() > 0.4;
    const railList = isHorizontal ? rails.h : rails.v;
    if (!railList.length) return;

    const rail = railList[Math.floor(Math.random() * railList.length)];
    const streak = document.createElement("div");

    streak.className = isHorizontal ? "streak horizontal" : "streak vertical";

    const dir = Math.random() < 0.8 ? 1 : -1;
    const strong = Math.random() < 0.16;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const speed = strong
      ? 1400 + Math.random() * 400
      : 700 + Math.random() * 600;

    const opacity = 0.04 + Math.random() * 0.04;

    let start;
    let end;
    let distance;
    let duration;

    if (isHorizontal) {
      start = dir === 1 ? -900 : width + 900;
      end = dir === 1 ? width + 900 : -900;
      distance = end - start;
      duration = Math.abs(distance) / speed;

      streak.style.left = `${start}px`;
      streak.style.setProperty("--dx", `${distance}px`);
      streak.style.setProperty("--dy", "0px");
    } else {
      start = dir === 1 ? -900 : height + 900;
      end = dir === 1 ? height + 900 : -900;
      distance = end - start;
      duration = Math.abs(distance) / speed;

      streak.style.top = `${start}px`;
      streak.style.setProperty("--dx", "0px");
      streak.style.setProperty("--dy", `${distance}px`);
    }

    streak.style.setProperty("--final-opacity", opacity);
    streak.style.animationDuration = `${duration}s`;

    rail.appendChild(streak);

    setTimeout(() => streak.remove(), duration * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnStreak();

    const next = 300 + Math.random() * 700;
    setTimeout(spawnLoop, next);
  }

  function exitMenu() {
    running = false;
    window.removeEventListener("resize", rebuildGridRails);

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}