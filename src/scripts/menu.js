import { DEV } from "./dev.js";

export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");
  const ambient = document.querySelector(".ambient-bg");

  let running = true;
  let mode = "main"; // "main" | "ai-select"

  function init() {
    root.classList.add("menu-entering");
    ambient.classList.add("menu-active");

    bindButtons();

    if (DEV.enabled && DEV.skipMenuIntro) {
      root.classList.add("dev-no-delay");
      root.classList.add("menu-awake");
      spawnLoop();
      return;
    }

    setTimeout(() => {
      root.classList.add("menu-awake");
      spawnLoop();
    }, 3000);
  }

  // ====================
  // BUTTONS
  // ====================

  function bindButtons() {
    root.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;

        if (action === "ai") {
          enterAISelection();
          return;
        }

        if (action === "settings") {
          console.log("Settings not implemented yet");
        }
      });
    });
  }

  // ====================
  // AI SELECTION
  // ====================

  function enterAISelection() {
    mode = "ai-select";

    root.classList.add("ai-select-active");

    renderAICards();
  }

  function renderAICards() {
    const container = document.createElement("div");
    container.className = "ai-selection";

    const ais = [
      {
        name: "Drift",
        desc: "Erratic. Unpredictable. Fires blindly into the void.",
        level: 0,
        class: "drift",
      },
      {
        name: "Hunter",
        desc: "Tracks targets. Exploits weaknesses. Adapts mid-combat.",
        level: 1,
        class: "hunter",
      },
      {
        name: "Sentinel",
        desc: "Calculates outcomes. Eliminates inefficiency. Never misses twice.",
        level: 2,
        class: "sentinel",
      },
    ];

    ais.forEach((ai, i) => {
      const card = document.createElement("div");
      card.className = `ai-card ${ai.class}`;
      card.style.animationDelay = `${i * 80}ms`;

      card.innerHTML = `
        <div class="ai-name">${ai.name}</div>
        <div class="ai-visual"></div>
        <div class="ai-desc">${ai.desc}</div>
        <button class="ai-select-btn">Engage</button>
      `;

      card.querySelector(".ai-select-btn").addEventListener("click", () => {
        selectAI(ai.level, card, container);
      });

      container.appendChild(card);
    });

    const back = document.createElement("button");
    back.className = "ai-back-btn";
    back.textContent = "Back";

    back.addEventListener("click", () => {
      container.remove();
      root.classList.remove("ai-select-active");
      mode = "main";
    });

    container.appendChild(back);

    root.appendChild(container);
  }

  function selectAI(level, card, container) {
    const cards = container.querySelectorAll(".ai-card");

    cards.forEach((c) => {
      if (c !== card) c.classList.add("dim");
    });

    card.classList.add("selected");

    setTimeout(() => {
      exitMenu();
      onStart({ mode: "ai", difficulty: level });
    }, 500);
  }

  // ====================
  // BACKGROUND
  // ====================

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

  // ====================
  // EXIT
  // ====================

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