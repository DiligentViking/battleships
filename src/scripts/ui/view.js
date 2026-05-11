import { once } from "../models/utils.js";

export function View(root, sound) {
  // ====================
  // DOM
  // ====================

  const ambientBg = document.querySelector(".ambient-bg");

  const DOM = {
    message: root.querySelector(".message"),

    middleArea: root.querySelector(".middle-area"),

    p1BoardWrapper: root.querySelector(".board-wrapper.p1"),
    p2BoardWrapper: root.querySelector(".board-wrapper.p2"),

    p1Board: root.querySelector(".board.p1"),
    p2Board: root.querySelector(".board.p2"),

    fleetWrapper: root.querySelector(".fleet-wrapper"),
    fleetContainer: root.querySelector(".fleet-container"),

    resetBtn: root.querySelector(".reset"),
    randomBtn: root.querySelector(".random"),
    deployBtn: root.querySelector(".deploy"),
  };

  // ====================
  // STATE / CACHE
  // ====================

  const cellMap = {
    p1: [],
    p2: [],
  };

  let finalHitOverlay = null;
  let finalHitTargetCell = null;

  let prevPulseShipID; // for sound
  let debugRevealShips = false;

  function getBoardKey(playerName) {
    return DOM.p1Board.dataset.playername === playerName ? "p1" : "p2";
  }

  function getBoard(playerName) {
    return getBoardKey(playerName) === "p1" ? DOM.p1Board : DOM.p2Board;
  }

  function getCell(playerName, [y, x]) {
    return cellMap[getBoardKey(playerName)][y]?.[x];
  }

  // ====================
  // UTILS
  // ====================

  function parseCellCoords(cell) {
    return cell.dataset.coords.split(",").map(Number);
  }

  function showBattleMessage() {
    DOM.message.textContent = "Battle";
    DOM.message.classList.remove("setup-exiting", "battle-title-enter");

    requestAnimationFrame(() => {
      DOM.message.classList.add("battle-title-enter");
    });

    once(DOM.message, "animationend", () => {
      DOM.message.classList.remove("battle-title-enter");
    });
  }

  // ====================
  // FLIP / LAYOUT ANIMATION
  // ====================

  const FLIP_DURATION = 760;
  const FLIP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  function getRects(elements) {
    return new Map(elements.map((el) => [el, el.getBoundingClientRect()]));
  }

  function playFlip(firstRects, elements) {
    const animations = elements.map((el) => {
      const first = firstRects.get(el);
      const last = el.getBoundingClientRect();

      if (!first) return Promise.resolve();

      const dx = Math.round((first.left - last.left) * 100) / 100;
      const dy = Math.round((first.top - last.top) * 100) / 100;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        return Promise.resolve();
      }

      el.style.willChange = "transform";
      el.style.transformOrigin = "center center";

      const animation = el.animate(
        [
          { transform: `translate3d(${dx}px, ${dy}px, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: FLIP_DURATION,
          easing: FLIP_EASING,
          fill: "none",
        },
      );

      return animation.finished
        .catch(() => {})
        .finally(() => {
          el.style.willChange = "";
          el.style.transformOrigin = "";
        });
    });

    return Promise.all(animations);
  }

  function freezeToViewport(el) {
    const rect = el.getBoundingClientRect();
    const computed = getComputedStyle(el);

    el.classList.add("layout-frozen");

    el.style.position = "fixed";
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.margin = "0";
    el.style.zIndex = "20";
    el.style.pointerEvents = "none";

    // Prevent existing class transforms from being applied a second time.
    el.style.transform = "none";
    el.style.opacity = computed.opacity;
    el.style.filter = computed.filter;

    return rect;
  }

  function clearLayoutAnimationStyles({ clearRootLock = false } = {}) {
    [DOM.p1BoardWrapper, DOM.p2BoardWrapper, DOM.fleetWrapper].forEach((el) => {
      if (!el) return;

      el.classList.remove("layout-frozen");

      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";
      el.style.margin = "";
      el.style.zIndex = "";
      el.style.pointerEvents = "";
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      el.style.filter = "";
      el.style.willChange = "";
    });

    if (clearRootLock) {
      root.style.minHeight = "";
    }
  }

  function lockRootSize() {
    root.style.minHeight = `${root.offsetHeight}px`;
  }

  function finishDeployCleanup() {
    DOM.fleetWrapper.classList.add("remove");
    DOM.deployBtn.classList.add("remove");

    DOM.fleetWrapper.classList.remove("setup-exiting");
    DOM.deployBtn.classList.remove("setup-exiting", "deploy-committing");
    DOM.p2BoardWrapper.classList.remove("battle-revealing");

    clearLayoutAnimationStyles();
  }

  // ====================
  // SVG
  // ====================

  const SVG = {
    ship(type, isP2, isVertical, hidden = false) {
      const p2 = isP2 ? "p2" : "";
      const vertical = isVertical ? "vertical" : "";
      const hide = hidden ? "hide" : "";

      const variants = {
        nose: `
        <svg class="nose ${p2} ${vertical} ${hide}" viewBox="0 0 120 75" preserveAspectRatio="none">
          <path d="M120 15 L85 60 L0 60 L0 15 Z" class="hull"/>
          <path d="M105 23 L80 50 L15 50" class="detail"/>
        </svg>
        `,

        mid: `
        <svg class="mid ${p2} ${vertical} ${hide}" viewBox="0 0 120 75" preserveAspectRatio="none">
          <rect x="0" y="15" width="120" height="45" class="hull"/>
          <line x1="10" y1="30" x2="110" y2="30" class="detail"/>
          <line x1="10" y1="48" x2="90" y2="48" class="detail faint"/>
        </svg>
        `,

        tail: `
        <svg class="tail ${p2} ${vertical} ${hide}" viewBox="0 0 120 75" preserveAspectRatio="none">
          <rect x="35" y="15" width="85" height="45" class="hull"/>
          <rect x="15" y="22" width="20" height="30" class="engine"/>
          <rect x="5" y="26" width="10" height="22" class="engine-glow"/>
        </svg>
        `,
      };

      return variants[type];
    },

    hit() {
      return `<svg viewBox="0 0 24 24">
        <path d="M12 3V7M12 17V21M3 12H7M17 12H21M19 12C19 15.8 15.8 19 12 19C8.2 19 5 15.8 5 12C5 8.2 8.2 5 12 5C15.8 5 19 8.2 19 12Z"
        fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>`;
    },

    miss() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30"
          fill="none" stroke="currentColor" stroke-width="4"/>
      </svg>`;
    },
  };

  // ====================
  // BOARD
  // ====================

  function renderBoard(playerName, size) {
    const board = getBoard(playerName);
    const key = getBoardKey(playerName);

    board.textContent = "";
    cellMap[key] = [];

    for (let y = 0; y < size; y++) {
      cellMap[key][y] = [];

      for (let x = 0; x < size; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.coords = `${y},${x}`;

        board.appendChild(cell);
        cellMap[key][y][x] = cell;
      }
    }
  }

  function clearPreview(playerName) {
    const board = getBoard(playerName);
    board
      .querySelectorAll(".preview")
      .forEach((c) => c.classList.remove("preview", "invalid"));
  }

  function updatePreview(playerName, coordsList, valid) {
    clearPreview(playerName);

    coordsList.forEach((coords) => {
      const cell = getCell(playerName, coords);
      if (!cell) return;

      cell.classList.add("preview");
      if (!valid) cell.classList.add("invalid");
    });
  }

  // ====================
  // FLEET
  // ====================

  function getFleetPositions() {
    const map = new Map();
    DOM.fleetContainer
      .querySelectorAll(".ship-container")
      .forEach((el) => map.set(el, el.getBoundingClientRect()));
    return map;
  }

  function animateFleet(oldPositions) {
    DOM.fleetContainer.querySelectorAll(".ship-container").forEach((ship) => {
      const old = oldPositions.get(ship);
      if (!old) return;

      const now = ship.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;

      if (!dx && !dy) return;

      ship.querySelectorAll(".ship-segment").forEach((seg, i) => {
        seg.style.transform = `translate(${dx}px, ${dy}px)`;
        seg.style.transition = "none";
        setTimeout(() => {
          sound.ship.adjust();

          requestAnimationFrame(() => {
            seg.style.transform = "";
            seg.style.transition = `transform 320ms cubic-bezier(0.34,1.56,0.64,1)`;
          });
        }, i * 60);
      });
    });
  }

  function addPlaceableShip(shipID, length = shipID + 1) {
    const container = document.createElement("div");
    container.className = "ship-container";
    container.dataset.shipid = shipID;

    for (let i = 0; i < length; i++) {
      const seg = document.createElement("div");
      seg.className = "ship-segment";
      seg.dataset.segmentnum = i;

      let type;
      if (i === length - 1) type = "nose";
      else if (i === 0) type = "tail";
      else type = "mid";
      seg.innerHTML = SVG.ship(type);

      container.appendChild(seg);
    }

    DOM.fleetContainer.appendChild(container);
  }

  function removePlaceableShip(shipID) {
    const old = getFleetPositions();

    DOM.fleetContainer.querySelector(`[data-shipid="${shipID}"]`)?.remove();

    requestAnimationFrame(() => animateFleet(old));
  }

  function selectShip(shipID) {
    const prevShipSegments = DOM.fleetContainer.querySelectorAll(".floating");
    if (prevShipSegments[0]?.parentNode.dataset.shipid === `${shipID}`) return;
    for (let i = 0; i < prevShipSegments.length; i++) {
      const shipSegment = prevShipSegments[i];
      setTimeout(() => {
        shipSegment.classList.remove("glow");
        // once(shipSegment, "transitionend", () => {
        //   shipSegment.classList.add("floating");
        // });
      }, i * 80);
      once(shipSegment, "animationiteration", () => {
        shipSegment.classList.remove("floating");
        shipSegment.classList.remove("float-up");
        shipSegment.classList.add("float-down");
      });
    }

    const shipContainer = DOM.fleetContainer.querySelector(
      `[data-shipid="${shipID}"]`,
    );
    const shipSegments = shipContainer.children;
    for (let i = 0; i < shipSegments.length; i++) {
      setTimeout(() => {
        sound.ship.selectSegment();

        const shipSegment = shipSegments[i];

        shipSegment.classList.add("glow");
        shipSegment.classList.add("float-up");
        once(shipSegment, "transitionend", () => {
          shipSegment.classList.add("floating");
        });
      }, i * 70);
    }

    sound.ship.startFleetPulse();
  }

  function toggleVerticalShips(isVertical) {
    DOM.fleetContainer.classList.toggle("vertical");

    const cellSvgs = DOM.fleetContainer.querySelectorAll("svg");
    for (const svg of cellSvgs) {
      if (svg.parentNode.parentNode.dataset.shipid === "0") continue;
      if (svg.classList.contains("nose")) {
        svg.parentNode.innerHTML = SVG.ship("tail", null, isVertical);
      } else if (svg.classList.contains("tail")) {
        svg.parentNode.innerHTML = SVG.ship("nose", null, isVertical);
      }
      svg.classList.toggle("vertical");
    }
  }

  const Animation = {
    getFleetSourceRects(shipLength) {
      const fleetShip = DOM.fleetContainer.querySelector(
        `.ship-container[data-shipid="${shipLength - 1}"]`,
      );

      if (!fleetShip) return [];

      return Array.from(fleetShip.querySelectorAll(".ship-segment")).map(
        (seg) => seg.getBoundingClientRect(),
      );
    },

    animateShipSegments(targetCells, sourceRects) {
      targetCells.forEach((cell, i) => {
        const seg = cell.firstElementChild;
        if (!seg || !sourceRects[i]) return;

        const targetRect = cell.getBoundingClientRect();
        const sourceRect = sourceRects[i];

        const dx = sourceRect.left - targetRect.left;
        const dy = sourceRect.top - targetRect.top;

        // INVERT
        seg.style.translate = `${dx}px ${dy}px`;
        seg.style.scale = "0.8";
        seg.style.opacity = "0.25";

        // PLAY
        setTimeout(() => {
          sound.ship.placeSegment();

          requestAnimationFrame(() => {
            seg.style.translate = "";
            seg.style.scale = "";
            seg.style.opacity = "";

            seg.style.transition = `
              translate 400ms cubic-bezier(0.22,1,0.36,1),
              scale 400ms cubic-bezier(0.22,1,0.36,1),
              opacity 300ms ease
          `;
          });
        }, i * 70);
      });
    },
  };

  // ====================
  // SHIP PLACEMENT
  // ====================

  function placeShip(playerName, coordsList, shipID, isVertical) {
    clearPreview(playerName);

    // 1. Get animation source (fleet positions)
    const sourceRects = Animation.getFleetSourceRects(coordsList.length);

    const targetCells = [];

    // 2. Render ship onto board
    coordsList.forEach((coords, i) => {
      const cell = getCell(playerName, coords);
      if (!cell) return;

      cell.classList.add("ship");
      cell.dataset.shipid = shipID;

      const isP2 = playerName === DOM.p2Board.dataset.playername;
      const hidden = isP2 && !debugRevealShips;

      let type;
      if (!isP2 || isVertical) {
        if (i === coordsList.length - 1) type = "nose";
        else if (i === 0) type = "tail";
        else type = "mid";
      } else {
        if (i === 0) type = "nose";
        else if (i === coordsList.length - 1) type = "tail";
        else type = "mid";
      }

      if (shipID === 0) isVertical = false;

      cell.innerHTML = SVG.ship(type, isP2, isVertical, hidden);

      targetCells.push(cell);
    });

    // 3. Animate AFTER DOM is ready
    requestAnimationFrame(() => {
      Animation.animateShipSegments(targetCells, sourceRects);
    });

    sound.ship.stopFleetPulse();
  }

  // ====================
  // EFFECTS
  // ====================

  const Effects = {
    impact(cell, hit, { finalHit = false } = {}) {
      sound.board.impact(hit);

      const icon = document.createElement("div");
      icon.className = `${hit ? "hit-icon" : "miss-icon"}${
        finalHit ? " final-hit-icon" : ""
      }`;
      icon.innerHTML = hit ? SVG.hit() : SVG.miss();

      cell.appendChild(icon);
      requestAnimationFrame(() => icon.classList.add("icon-animate"));
      once(icon, "animationend", () => icon.remove());

      const wave = document.createElement("div");
      wave.className = `shockwave ${hit ? "hit" : "miss"}${
        finalHit ? " final-hit-wave" : ""
      }`;

      cell.appendChild(wave);
      requestAnimationFrame(() => wave.classList.add("shockwave-animate"));
      once(wave, "animationend", () => wave.remove());
    },

    startPulse(board, shipID) {
      board.querySelectorAll(`[data-shipid="${shipID}"]`).forEach((cell, i) => {
        cell.classList.add("pulsing");
        cell.style.animationDelay = `${i * 150}ms`;
      });
    },

    stopPulse(board, shipID) {
      board
        .querySelectorAll(`[data-shipid="${shipID}"]`)
        .forEach((cell) =>
          once(cell, "animationiteration", () =>
            cell.classList.remove("pulsing"),
          ),
        );
    },

    flash(board, shipID) {
      sound.ship.sunk();
      sound.ship.stopDamagePulse();

      const cells = Array.from(
        board.querySelectorAll(`[data-shipid="${shipID}"]`),
      );
      if (!cells.length) return;

      const rects = cells.map((c) => c.getBoundingClientRect());

      const minX = Math.min(...rects.map((r) => r.left));
      const maxX = Math.max(...rects.map((r) => r.right));
      const minY = Math.min(...rects.map((r) => r.top));
      const maxY = Math.max(...rects.map((r) => r.bottom));

      const boardRect = board.getBoundingClientRect();

      const flash = document.createElement("div");
      flash.className = "ship-flash";

      flash.style.left = `${minX - boardRect.left}px`;
      flash.style.top = `${minY - boardRect.top}px`;
      flash.style.width = `${maxX - minX}px`;
      flash.style.height = `${maxY - minY}px`;

      if (maxY - minY > maxX - minX) {
        flash.classList.add("vertical");
      }

      board.appendChild(flash);

      requestAnimationFrame(() => {
        flash.classList.add("flash-animate");
      });

      once(flash, "animationend", () => flash.remove());
    },
  };

  function clearFinalHitCinematic() {
    finalHitTargetCell?.classList.remove("final-hit-target");
    finalHitTargetCell = null;

    finalHitOverlay?.remove();
    finalHitOverlay = null;

    root.classList.remove(
      "final-hit-cinematic",
      "final-hit-impacting",
      "final-hit-victory",
      "final-hit-defeat",
    );
  }

  function createFinalHitOverlay(cell) {
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const overlay = document.createElement("div");
    overlay.className = "final-hit-focus";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
      <div class="final-hit-focus__shade"></div>
    `;

    overlay.style.setProperty("--target-x", `${centerX}px`);
    overlay.style.setProperty("--target-y", `${centerY}px`);
    overlay.style.setProperty(
      "--target-size",
      `${Math.max(rect.width, rect.height)}px`,
    );

    return overlay;
  }

  function setAmbientPhase(phase) {
    if (!ambientBg) return;

    ambientBg.classList.remove(
      "menu-active",
      "setup-phase",
      "battle-phase",
      "victory-phase",
      "defeat-phase",
    );

    if (phase) {
      ambientBg.classList.add(phase);
    }
  }

  function getEndgameCopy(outcome, aiLevel) {
    const playerWon = outcome === "victory";

    const aiCopy = {
      0: playerWon
        ? {
            kicker: "Drift Dispersed",
            title: "Victory",
            subtitle: "Erratic targeting patterns eradicated.",
          }
        : {
            kicker: "Drift Prevails",
            title: "Defeat",
            subtitle: "The void answered back.",
          },

      1: playerWon
        ? {
            kicker: "Hunter Broken",
            title: "Victory",
            subtitle: "Pursuit pattern terminated.",
          }
        : {
            kicker: "Hunter Dominant",
            title: "Defeat",
            subtitle: "Lock acquired. Resistance ended.",
          },

      2: playerWon
        ? {
            kicker: "Sentinel Overridden",
            title: "Victory",
            subtitle: "Human command prevails.",
          }
        : {
            kicker: "Sentinel Ascendant",
            title: "Defeat",
            subtitle: "Resistance proficiently eliminated.",
          },
    };

    return aiCopy[aiLevel];
  }

  function createEndgameOverlay({ outcome, aiLevel, onReturnToMenu }) {
    const { kicker, title, subtitle } = getEndgameCopy(outcome, aiLevel);

    const overlay = document.createElement("section");
    overlay.className = `endgame-overlay ${outcome}`;
    overlay.setAttribute("aria-labelledby", "endgameTitle");
    overlay.setAttribute("aria-describedby", "endgameSubtitle");

    overlay.innerHTML = `
    <div class="endgame-overlay__scan"></div>

    <div class="endgame-panel" role="dialog" aria-modal="false">
      <div class="endgame-panel__ring"></div>

      <p class="endgame-kicker">
        ${kicker}
      </p>

      <h2 class="endgame-title" id="endgameTitle">${title}</h2>
      <p class="endgame-subtitle" id="endgameSubtitle">${subtitle}</p>

      <button class="endgame-return" type="button" aria-label="Return to main menu">
        Return to Menu
      </button>
    </div>
  `;

    const returnBtn = overlay.querySelector(".endgame-return");

    returnBtn.addEventListener("click", () => {
      sound.ui.buttonClick();
      onReturnToMenu?.();
    });

    returnBtn.addEventListener("mouseenter", sound.ui.buttonHover);
    returnBtn.addEventListener("mouseleave", sound.ui.clearButtonHover);

    return overlay;
  }

  // ====================
  // PUBLIC API
  // ====================

  return {
    eventElems: {
      p1Board: DOM.p1Board,
      p2Board: DOM.p2Board,
      fleetContainer: DOM.fleetContainer,
      resetBtn: DOM.resetBtn,
      randomBtn: DOM.randomBtn,
      deployBtn: DOM.deployBtn,
    },

    initBoardPlayerNames(p1, p2) {
      DOM.p1Board.dataset.playername = p1;
      DOM.p2Board.dataset.playername = p2;
    },

    renderBoard,

    parseCellCoords,

    // Setup
    enterSetupPhase() {
      DOM.message.textContent = "Position Fleet";

      DOM.middleArea.classList.remove("battle-layout");
      DOM.middleArea.classList.add("setup-layout");

      DOM.p2BoardWrapper.classList.add("remove");
      DOM.p2BoardWrapper.classList.remove("hide", "battle-revealing");

      DOM.fleetWrapper.classList.remove("remove", "setup-exiting");
      DOM.fleetContainer.classList.remove("hide");

      DOM.deployBtn.classList.remove("hide", "remove", "setup-exiting");

      DOM.p1Board.classList.add("placement-phase");

      clearLayoutAnimationStyles({ clearRootLock: true });
    },

    setDeployReady(isReady) {
      DOM.deployBtn.disabled = !isReady;
      DOM.deployBtn.classList.toggle("deploy-ready", isReady);
      DOM.deployBtn.classList.toggle("deploy-locked", !isReady);

      DOM.deployBtn.setAttribute(
        "aria-label",
        isReady ? "Deploy fleet" : "Deploy locked until all ships are placed",
      );
    },

    addPlaceableShip,
    removePlaceableShip,
    updatePreview,
    clearPreview,
    selectShip,
    placeShip,
    toggleVerticalShips,
    setAmbientPhase,

    playDeployTransition() {
      return new Promise((resolve) => {
        const LOCK_AT = 620;
        const LAYOUT_SHIFT_AT = 2050;
        const FINISH_AT = 3550;

        let layoutPromise = Promise.resolve();

        const overlay = document.createElement("div");
        overlay.className = "phase-transition";
        overlay.innerHTML = `
          <div class="phase-transition__vignette"></div>
          <div class="phase-transition__scan"></div>
          <div class="phase-transition__core">
            <div class="phase-transition__ring"></div>
            <div class="phase-transition__title">Locked In</div>
            <div class="phase-transition__subtitle">Enemy Fleet Incoming</div>
          </div>
        `;

        sound.ui.deploy();

        lockRootSize();

        root.classList.add("deploy-transition-active");
        DOM.deployBtn.classList.add("deploy-committing");

        setTimeout(() => {
          sound.ui.shimmerTransition();
        }, LOCK_AT - 200);

        setTimeout(() => {
          sound.ui.lockedIn();

          root.appendChild(overlay);
          root.classList.add("deploy-transition-lock");
        }, LOCK_AT);

        setTimeout(() => {
          sound.ui.cinematicTransition();
        }, LAYOUT_SHIFT_AT - 250);

        setTimeout(() => {
          const movingEls = [DOM.p1BoardWrapper];
          const firstRects = getRects(movingEls);

          freezeToViewport(DOM.fleetWrapper);

          this.enterBattlePhase({
            deferRemoval: true,
            deferMessage: true,
          });

          // Force the initial p2 reveal state to be committed before animation starts.
          DOM.p2BoardWrapper.getBoundingClientRect();

          requestAnimationFrame(() => {
            root.classList.add("deploy-layout-shifting");
            root.classList.add("battle-grid-reveal");

            layoutPromise = playFlip(firstRects, movingEls).finally(() => {
              root.classList.remove("deploy-layout-shifting");
            });
          });
        }, LAYOUT_SHIFT_AT);

        setTimeout(() => {
          layoutPromise.finally(() => {
            finishDeployCleanup();

            showBattleMessage();

            requestAnimationFrame(() => {
              root.classList.remove(
                "deploy-transition-active",
                "deploy-transition-lock",
                "battle-grid-reveal",
                "deploy-layout-shifting",
              );

              overlay.remove();

              resolve();
            });
          });
        }, FINISH_AT);
      });
    },

    // Battle
    enterBattlePhase({ deferRemoval = false, deferMessage = false } = {}) {
      if (!deferMessage) {
        DOM.message.textContent = "Battle";
      }

      DOM.middleArea.classList.remove("setup-layout");
      DOM.middleArea.classList.add("battle-layout");

      DOM.p2BoardWrapper.classList.add("battle-revealing");
      DOM.p2BoardWrapper.classList.remove("remove", "hide");

      DOM.fleetWrapper.classList.add("setup-exiting");
      DOM.deployBtn.classList.add("setup-exiting");

      if (!deferRemoval) {
        once(DOM.fleetWrapper, "transitionend", () =>
          DOM.fleetWrapper.classList.add("remove"),
        );

        once(DOM.deployBtn, "transitionend", () =>
          DOM.deployBtn.classList.add("remove"),
        );
      }

      DOM.p1Board.classList.remove("placement-phase");
      DOM.p2Board.classList.remove("placement-phase");

      DOM.p1Board.classList.add("battle-phase");
      DOM.p2Board.classList.add("battle-phase");
    },

    enterEndgame({ outcome, aiLevel, onReturnToMenu }) {
      const playerWon = outcome === "victory";

      setAmbientPhase(playerWon ? "victory-phase" : "defeat-phase");

      document.querySelector(".final-hit-focus__shade").classList.add("fade-out");

      root.classList.add("endgame-active", `endgame-${outcome}`);

      DOM.message.classList.remove("battle-title-enter");
      DOM.message.classList.add("fade-out");

      DOM.p1Board.classList.add("endgame-board");
      DOM.p2Board.classList.add("endgame-board");

      const overlay = createEndgameOverlay({
        outcome,
        aiLevel,
        onReturnToMenu,
      });

      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.classList.add("active");
        overlay.querySelector(".endgame-return")?.focus();
      });
    },

    prepareFinalHit({ playerName, coords }) {
      const cell = getCell(playerName, coords);
      if (!cell) return Promise.resolve();

      clearFinalHitCinematic();
      sound.board.clearCellHover();
      sound.ui.clearButtonHover();

      finalHitTargetCell = cell;
      finalHitTargetCell.classList.add("final-hit-target");

      finalHitOverlay = createFinalHitOverlay(cell);
      document.body.appendChild(finalHitOverlay);

      root.classList.add("final-hit-cinematic");

      requestAnimationFrame(() => {
        finalHitOverlay?.classList.add("active");
      });

      return new Promise((resolve) => setTimeout(resolve, 850));
    },

    resolveFinalHit({ outcome }) {
      root.classList.add(`final-hit-${outcome}`);
      root.classList.add("final-hit-impacting");

      return new Promise((resolve) => {
        setTimeout(() => {
          finalHitTargetCell?.classList.remove("final-hit-target");
          finalHitTargetCell = null;
          resolve();
        }, 650);
      });
    },

    clearFinalHitCinematic,

    playFireSound(isComputer) {
      sound.board.fire(isComputer);
    },

    playCellHoverSound(type) {
      sound.board.cellHover(type);
    },

    hitCell(playerName, coords, { finalHit = false } = {}) {
      const cell = getCell(playerName, coords);
      if (!cell) return;

      const board = getBoard(playerName);
      const hasShip = cell.classList.contains("ship");

      cell.classList.add("hit");
      Effects.impact(cell, hasShip, { finalHit });

      if (finalHit) {
        root.classList.add("final-hit-impacting");
        cell.classList.add("final-hit-impact");
      }

      if (!hasShip) return;

      const shipID = cell.dataset.shipid;
      Effects.startPulse(board, shipID);

      const pulseKey = `${playerName}-${shipID}`;
      if (prevPulseShipID === pulseKey) return;

      prevPulseShipID = pulseKey;

      sound.ship.startDamagePulse();
    },

    playButtonHoverSound() {
      sound.ui.buttonHover();
    },

    clearHoverSoundTimeout() {
      sound.board.clearCellHover();
      sound.ui.clearButtonHover();
    },

    playPlaceRandomSound() {
      sound.ship.placeRandom();
    },

    playDeploySound() {
      sound.ui.buttonClick();
    },

    revealShip(playerName, shipID, { finalHit = false } = {}) {
      const board = getBoard(playerName);

      Effects.stopPulse(board, shipID);

      return new Promise((resolve) => {
        setTimeout(
          () => {
            if (finalHit) {
              board
                .querySelectorAll(`[data-shipid="${shipID}"]`)
                .forEach((cell) => cell.classList.add("final-ship-collapse"));
            }

            Effects.flash(board, shipID);

            board
              .querySelectorAll(`[data-shipid="${shipID}"] svg`)
              .forEach((svg) => svg.classList.remove("hide"));

            setTimeout(resolve, finalHit ? 1200 : 700);
          },
          finalHit ? 450 : 250,
        );
      });
    },

    setDebugRevealShips(isEnabled) {
      debugRevealShips = isEnabled;

      DOM.p2Board
        .querySelectorAll(".ship svg")
        .forEach((svg) => svg.classList.toggle("hide", !debugRevealShips));
    },
  };
}
