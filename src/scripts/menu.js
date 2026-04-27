export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");

  const GRID = 80;
  const NODE_CHARGE_MS = 420;

  let running = true;
  let rails = { h: [], v: [] };
  let nodes = new Map();

  function init() {
    buildGridEffects();
    spawnLoop();
    bindButtons();

    window.addEventListener("resize", rebuildGridEffects);
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

  function buildGridEffects() {
    bg.textContent = "";

    rails = { h: [], v: [] };
    nodes = new Map();

    const width = window.innerWidth;
    const height = window.innerHeight;

    const cols = Math.ceil(width / GRID) + 1;
    const rows = Math.ceil(height / GRID) + 1;

    const railLayer = document.createElement("div");
    railLayer.className = "grid-rail-layer";

    const nodeLayer = document.createElement("div");
    nodeLayer.className = "grid-node-layer";

    for (let row = 0; row < rows; row++) {
      const y = row * GRID;

      const rail = document.createElement("div");
      rail.className = "grid-rail horizontal";
      rail.style.top = `${y}px`;

      railLayer.appendChild(rail);
      rails.h.push({ el: rail, y });
    }

    for (let col = 0; col < cols; col++) {
      const x = col * GRID;

      const rail = document.createElement("div");
      rail.className = "grid-rail vertical";
      rail.style.left = `${x}px`;

      railLayer.appendChild(rail);
      rails.v.push({ el: rail, x });
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * GRID;
        const y = row * GRID;

        const node = document.createElement("div");
        node.className = "grid-node";
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        nodeLayer.appendChild(node);
        nodes.set(`${x},${y}`, node);
      }
    }

    bg.appendChild(railLayer);
    bg.appendChild(nodeLayer);
  }

  function rebuildGridEffects() {
    buildGridEffects();
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

      chargeNodesAlongPath({
        isHorizontal: true,
        fixed: rail.y,
        start,
        end,
        duration,
      });
    } else {
      start = dir === 1 ? -900 : height + 900;
      end = dir === 1 ? height + 900 : -900;
      distance = end - start;
      duration = Math.abs(distance) / speed;

      streak.style.top = `${start}px`;
      streak.style.setProperty("--dx", "0px");
      streak.style.setProperty("--dy", `${distance}px`);

      chargeNodesAlongPath({
        isHorizontal: false,
        fixed: rail.x,
        start,
        end,
        duration,
      });
    }

    streak.style.setProperty("--final-opacity", opacity);
    streak.style.animationDuration = `${duration}s`;

    rail.el.appendChild(streak);

    setTimeout(() => streak.remove(), duration * 1000);
  }

  function chargeNodesAlongPath({ isHorizontal, fixed, start, end, duration }) {
    const dir = end > start ? 1 : -1;
    const first = dir === 1
      ? Math.ceil(0 / GRID) * GRID
      : Math.floor((isHorizontal ? window.innerWidth : window.innerHeight) / GRID) * GRID;

    const limit = isHorizontal ? window.innerWidth : window.innerHeight;

    for (
      let moving = first;
      dir === 1 ? moving <= limit : moving >= 0;
      moving += GRID * dir
    ) {
      const headOffset = 420 * dir;
      const adjusted = moving - headOffset;
      const progress = Math.abs(adjusted - start) / Math.abs(end - start);
      const delay = Math.max(0, Math.min(progress, 1)) * duration * 1000;

      setTimeout(() => {
        if (!running) return;

        const x = isHorizontal ? moving : fixed;
        const y = isHorizontal ? fixed : moving;

        chargeNode(x, y);
      }, delay);
    }
  }

  function chargeNode(x, y) {
    const node = nodes.get(`${x},${y}`);
    if (!node) return;

    node.classList.remove("charged");
    void node.offsetWidth;
    node.classList.add("charged");

    setTimeout(() => {
      node.classList.remove("charged");
    }, NODE_CHARGE_MS);
  }

  function spawnLoop() {
    if (!running) return;

    spawnStreak();

    const next = 300 + Math.random() * 700;
    setTimeout(spawnLoop, next);
  }

  function exitMenu() {
    running = false;
    window.removeEventListener("resize", rebuildGridEffects);

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}