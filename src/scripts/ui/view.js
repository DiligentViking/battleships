export function View(root) {
  // ====================
  // DOM
  // ====================

  const DOM = {
    message: root.querySelector(".message"),

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
  // SOUND SYSTEM
  // ====================

  let hoverSoundTimeout;
  let pulseSoundInterval;

  let prevPulseShipID;

  const Sound = (() => {
    const sounds = {
      selectShip1: new Audio("assets/sfx/select-ship-1.mp3"),
      selectShip2: new Audio("assets/sfx/select-ship-2.mp3"),
      placeWoosh: new Audio("assets/sfx/place-whoosh.mp3"),
      adjustShip: new Audio("assets/sfx/adjust-ship.mp3"),

      placeRandom: new Audio("assets/sfx/place-random.wav"),

      hoverCell: new Audio("assets/sfx/hover-cell.mp3"),
      hoverValid: new Audio("assets/sfx/hover-valid.mp3"),
      hoverInvalid: new Audio("assets/sfx/hover-invalid.mp3"),
      hoverButton: new Audio("assets/sfx/hover-button.mp3"),

      hit: new Audio("assets/sfx/sci-fi-gun.mp3"),
      miss: new Audio("assets/sfx/tribecore-kick.mp3"),
      sunk: new Audio("assets/sfx/metallic-impact.wav"),
      fire: new Audio("assets/sfx/sci-fi-cannon.mp3"),

      floatPulse: new Audio("assets/sfx/float-pulse.wav"),
      shipPulse: new Audio("assets/sfx/ship-pulse.wav"),
    };

    function play(name, isComputer, { volume = 1, playbackRate = 1 } = {}) {
      if (isComputer) volume = volume * 0.4;

      const base = sounds[name];
      if (!base) return;

      const s = base.cloneNode();
      s.volume = volume;
      s.playbackRate = playbackRate;
      s.play().catch(() => {});
    }

    return { play };
  })();

  // ====================
  // STATE / CACHE
  // ====================

  const cellMap = {
    p1: [],
    p2: [],
  };

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

  function once(el, event, cb) {
    const handler = () => {
      el.removeEventListener(event, handler);
      cb();
    };
    el.addEventListener(event, handler);
  }

  function parseCellCoords(cell) {
    return cell.dataset.coords.split(",").map(Number);
  }

  // ====================
  // SVG
  // ====================

  const SVG = {
    ship(isHull, isP2, hide) {
      const p2 = isP2 ? "p2" : "";
      const h = hide ? "hide" : "";

      return isHull
        ? `<svg class="hull ${p2} ${h}" viewBox="0 0 90 80">
            <path d="M15 65 C15 30, 45 15, 80 20 L80 65 Z"
              stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>`
        : `<svg class="body ${p2} ${h}" viewBox="0 0 90 80">
            <rect x="8" y="12"
              stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>`;
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
          Sound.play("adjustShip", null, { volume: 0.04 });

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

      seg.innerHTML = SVG.ship(i === length - 1);
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
        Sound.play("selectShip2", null, { volume: 0.1 });
        setTimeout(() => {
          Sound.play("selectShip3", null, { volume: 0.1 });
        }, 10);

        const shipSegment = shipSegments[i];

        shipSegment.classList.add("glow");
        shipSegment.classList.add("float-up");
        once(shipSegment, "transitionend", () => {
          shipSegment.classList.add("floating");
        });
      }, i * 70);
    }

    Sound.play("floatPulse", null, { volume: 0.02, playbackRate: 0.5 });
    clearInterval(pulseSoundInterval);
    pulseSoundInterval = setInterval(() => {
      Sound.play("floatPulse", null, { volume: 0.03, playbackRate: 0.5 });
    }, 1200);
  }

  function toggleVerticalShips() {
    DOM.fleetContainer.classList.toggle("vertical");
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
          Sound.play("placeWoosh", null, { volume: 0.25 });

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

  function placeShip(playerName, coordsList, shipID) {
    clearPreview(playerName);

    const isP2 = playerName === DOM.p2Board.dataset.playername;

    // 1. Get animation source (fleet positions)
    const sourceRects = Animation.getFleetSourceRects(coordsList.length);

    const targetCells = [];

    // 2. Render ship onto board
    coordsList.forEach((coords, i) => {
      const cell = getCell(playerName, coords);
      if (!cell) return;

      const isHull = isP2 ? i === 0 : i === coordsList.length - 1;

      cell.classList.add("ship");
      cell.dataset.shipid = shipID;
      cell.innerHTML = SVG.ship(isHull, isP2, isP2);

      targetCells.push(cell);
    });

    // 3. Animate AFTER DOM is ready
    requestAnimationFrame(() => {
      Animation.animateShipSegments(targetCells, sourceRects);
    });

    clearInterval(pulseSoundInterval);
  }

  // ====================
  // EFFECTS
  // ====================

  const Effects = {
    impact(cell, hit) {
      Sound.play(hit ? "hit" : "miss", {
        playbackRate: 0.95 + Math.random() * 0.1,
      });

      const icon = document.createElement("div");
      icon.className = hit ? "hit-icon" : "miss-icon";
      icon.innerHTML = hit ? SVG.hit() : SVG.miss();

      cell.appendChild(icon);
      requestAnimationFrame(() => icon.classList.add("icon-animate"));
      once(icon, "animationend", () => icon.remove());

      const wave = document.createElement("div");
      wave.className = `shockwave ${hit ? "hit" : "miss"}`;

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
      Sound.play("sunk", { volume: 0.8 });
      clearInterval(pulseSoundInterval);

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
      DOM.p2BoardWrapper.classList.add("remove");
      DOM.fleetContainer.classList.remove("hide");
      DOM.deployBtn.classList.remove("hide");
      DOM.p1Board.classList.add("placement-phase");
    },

    addPlaceableShip,
    removePlaceableShip,
    updatePreview,
    clearPreview,
    selectShip,
    placeShip,
    toggleVerticalShips,

    // Battle
    enterBattlePhase() {
      DOM.message.textContent = "Battle";

      DOM.p2BoardWrapper.classList.remove("remove");
      DOM.p2BoardWrapper.classList.remove("hide");

      DOM.fleetWrapper.classList.add("fade-out");
      once(DOM.fleetWrapper, "transitionend", () =>
        DOM.fleetWrapper.classList.add("remove"),
      );

      DOM.deployBtn.classList.add("fade-out");
      once(DOM.deployBtn, "transitionend", () =>
        DOM.deployBtn.classList.add("remove"),
      );

      DOM.p1Board.classList.remove("placement-phase");
      DOM.p2Board.classList.remove("placement-phase");
      DOM.p1Board.classList.add("battle-phase");
      DOM.p2Board.classList.add("battle-phase");
    },

    hitCell(playerName, coords) {
      const cell = getCell(playerName, coords);
      const board = getBoard(playerName);

      const hasShip = cell.classList.contains("ship");

      const shipID = cell.dataset.shipid;
      const isComputer = getBoardKey(playerName) === "p2";

      Effects.impact(cell, hasShip);
      cell.classList.add("hit");

      if (!hasShip) return;
      Effects.startPulse(board, shipID);

      if (prevPulseShipID === shipID) return;
      if (!isComputer) return;
      prevPulseShipID = shipID;
      setTimeout(() => {
        Sound.play("shipPulse", null, { volume: 0.10, playbackRate: 0.5 });
        pulseSoundInterval = setInterval(() => {
          Sound.play("shipPulse", null, { volume: 0.12, playbackRate: 0.5 });
        }, 1200);
      }, 300);
    },

    playFireSound(isComputer) {
      Sound.play("fire", isComputer, { volume: 0.3 });
    },

    playCellHoverSound(sound) {
      if (!["hoverValid", "hoverInvalid", "hoverCell"].includes(sound))
        throw Error(`"${sound}" is not a valid cell hover sound parameter.`);

      const volumeMap = {
        hoverValid: 0.05,
        hoverInvalid: 0.14,
        hoverCell: 0.1,
      };
      const volume = volumeMap[sound];

      clearTimeout(hoverSoundTimeout);
      hoverSoundTimeout = setTimeout(() => {
        Sound.play(sound, null, { volume });
      }, 100);
    },

    playButtonHoverSound() {
      clearTimeout(hoverSoundTimeout);
      hoverSoundTimeout = setTimeout(() => {
        Sound.play("hoverButton", null, { volume: 0.8 });
      }, 80);
    },

    clearHoverSoundTimeout() {
      clearTimeout(hoverSoundTimeout);
    },

    playPlaceRandomSound() {
      Sound.play("placeRandom", null, { volume: 0.25 });
    },

    revealShip(playerName, shipID) {
      const board = getBoard(playerName);

      Effects.stopPulse(board, shipID);

      setTimeout(() => {
        Effects.flash(board, shipID);

        board
          .querySelectorAll(`[data-shipid="${shipID}"] svg`)
          .forEach((svg) => svg.classList.remove("hide"));
      }, 250);
    },
  };
}
