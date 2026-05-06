import { DEV } from "./dev.js";

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

  function bindMenuButtonSounds(btn) {
    btn.addEventListener("click", sound.ui.buttonClick);
    btn.addEventListener("mouseenter", sound.ui.buttonHover);
    btn.addEventListener("mouseleave", sound.ui.clearButtonHover);
  }

  function bindButtons() {
    root.querySelectorAll(".menu-btn").forEach((btn) => {
      bindMenuButtonSounds(btn);

      btn.addEventListener("click", () => {
        if (btn.dataset.action === "ai") {
          enterAISelection();
        }
      });
    });
  }

  // ====================
  // AI SELECTION
  // ====================

  const AIS = [
    {
      name: "Drift",
      desc: "Erratic. Fires blindly into the void.",
      level: 0,
      className: "drift",
    },
    {
      name: "Hunter",
      desc: "Relentless. Locks on, then pursues.",
      level: 1,
      className: "hunter",
    },
    {
      name: "Sentinel",
      desc: "Optimized. Eliminates inefficiency and collapses all resistance.",
      level: 2,
      className: "sentinel",
    },
  ];

  function enterAISelection() {
    if (mode === "ai-select") return;

    mode = "ai-select";
    root.querySelector(".menu-buttons").classList.add("ai-select-active");

    setTimeout(renderAICards, 180);
  }

  function exitAISelection() {
    if (selectingAI || !aiSelectionContainer) return;

    aiSelectionContainer.classList.add("ai-selection-exit");

    setTimeout(() => {
      root.querySelector(".menu-buttons").classList.remove("ai-select-active");
      aiSelectionContainer?.remove();
      aiSelectionContainer = null;
      mode = "main";
    }, 260);
  }

  function renderAICards() {
    if (mode !== "ai-select" || aiSelectionContainer) return;

    const container = document.createElement("div");
    container.className = "ai-selection";
    aiSelectionContainer = container;

    AIS.forEach((ai, i) => {
      const wrap = document.createElement("div");
      wrap.className = "ai-card-wrap";

      const card = createAICard(ai, i, container);
      wrap.appendChild(card);
      container.appendChild(wrap);

      setTimeout(() => {
        sound.ui.materializeSoft();
      }, i * 90);
    });

    container.appendChild(createAIBackButton());
    root.appendChild(container);
  }

  function createAICard(ai, index, container) {
    const card = document.createElement("button");
    const delay = index * 90;

    card.className = `ai-card ${ai.className}`;
    card.type = "button";
    card.style.animationDelay = `${delay}ms`;
    card.setAttribute("aria-label", `Engage ${ai.name} AI`);

    card.innerHTML = `
      <div class="ai-card-inner">
        <div class="ai-name">${ai.name}</div>
        <div class="ai-visual"></div>
        <div class="ai-desc">${ai.desc}</div>
      </div>
    `;

    card.addEventListener("animationend", (e) => {
      if (e.animationName !== "aiCardEnter") return;
      card.parentNode.classList.add("ready");
    });

    card.addEventListener("click", () => {
      selectAI(ai.level, card, container);
    });

    card.addEventListener("mouseenter", () => {
      if (selectingAI) return;
      sound.ui.shimmerHover();
    });

    card.addEventListener("mouseleave", () => {
      if (selectingAI) return;
      sound.ui.shimmerHover();
    });

    return card;
  }

  function createAIBackButton() {
    const back = document.createElement("button");

    back.className = "ai-back-btn";
    back.type = "button";
    back.textContent = "Back";

    bindMenuButtonSounds(back);
    back.addEventListener("click", exitAISelection);

    return back;
  }

  function selectAI(level, selectedCard, container) {
    if (selectingAI) return;

    selectingAI = true;
    sound.ui.clearShimmerHover();
    sound.ui.buttonClick();

    const cards = Array.from(container.querySelectorAll(".ai-card"));

    container.classList.add("ai-selection-committed");

    cards.forEach((card) => {
      card.style.pointerEvents = "none";
    });

    selectedCard.classList.add("selected", "ai-locking");

    dismissUnselectedAICards(cards, selectedCard);

    setTimeout(() => {
      sound.ui.shimmerLock();
    }, 560);
    setTimeout(() => {
      root.classList.add("camera-drop-active");
    }, 760);

    setTimeout(() => {
      onGameStart({ mode: "ai", difficulty: level });
    }, 1120);

    setTimeout(() => {
      exitMenu({ animated: false });
    }, 2100);
  }

  function dismissUnselectedAICards(cards, selectedCard) {
    cards.forEach((card) => {
      if (card === selectedCard) return;
      card.classList.add("ai-card-dismissed");
    });
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

  function exitMenu({ animated = true } = {}) {
    running = false;

    ambient.classList.remove("menu-active");

    root.style.pointerEvents = "none";

    if (!animated) {
      root.remove();
      return;
    }

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}
