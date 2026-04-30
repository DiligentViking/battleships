import { DEV } from "./dev.js";
import { once } from "./models/utils.js";

export function Menu(onGameStart, sound) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");
  const ambient = document.querySelector(".ambient-bg");

  let running = true;
  let mode = "main";
  let selectingAI = false;
  let aiSelectionContainer = null;

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
    if (mode === "ai-select") return;

    mode = "ai-select";
    root.querySelector(".menu-buttons").classList.add("ai-select-active");

    setTimeout(renderAICards, 180);
  }

  function exitAISelection() {
    if (selectingAI) return;
    if (!aiSelectionContainer) return;

    aiSelectionContainer.classList.add("ai-selection-exit");

    setTimeout(() => {
      root.querySelector(".menu-buttons").classList.remove("ai-select-active");
      aiSelectionContainer?.remove();
      aiSelectionContainer = null;
      mode = "main";
    }, 260);
  }

  function renderAICards() {
    if (mode !== "ai-select") return;
    if (aiSelectionContainer) return;

    const container = document.createElement("div");
    container.className = "ai-selection";
    aiSelectionContainer = container;

    const ais = [
      {
        name: "Drift",
        desc: "Erratic. Fires blindly into the void.",
        level: 0,
        class: "drift",
      },
      {
        name: "Hunter",
        desc: "Relentless. Locks on, then pursues.",
        level: 1,
        class: "hunter",
      },
      {
        name: "Sentinel",
        desc: "Optimized. Eliminates inefficiency and collapses all resistance.",
        level: 2,
        class: "sentinel",
      },
    ];

    ais.forEach((ai, i) => {
      const card = document.createElement("button");
      card.className = `ai-card ${ai.class}`;
      card.type = "button";
      card.style.animationDelay = `${i * 90}ms`;
      card.setAttribute("aria-label", `Engage ${ai.name} AI`);

      card.innerHTML = `
        <div class="ai-name">${ai.name}</div>
        <div class="ai-visual"></div>
        <div class="ai-desc">${ai.desc}</div>
      `;

      once(card, "animationend", (e) => {
        if (e.animationName !== "aiCardEnter") return;
        card.classList.add("ready");
      });

      card.addEventListener("click", () => {
        selectAI(ai.level, card, container);
      });

      container.appendChild(card);
    });

    const back = document.createElement("button");
    back.className = "ai-back-btn";
    back.type = "button";
    back.textContent = "Back";
    back.addEventListener("click", exitAISelection);

    container.appendChild(back);
    root.appendChild(container);
  }

  function selectAI(level, card, container) {
    if (selectingAI) return;

    selectingAI = true;

    const cards = container.querySelectorAll(".ai-card");

    cards.forEach((c) => {
      c.style.pointerEvents = "none";

      if (c !== card) {
        c.classList.add("dim");
      }
    });

    card.classList.add("selected");

    setTimeout(() => {
      exitMenu();
      onGameStart({ mode: "ai", difficulty: level });
    }, 650);
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
    root.style.pointerEvents = "none";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}
