export function View(root) {
  const message = root.querySelector(".message");

  const p2BoardWrapper = root.querySelector(".board-wrapper.p2");
  const p1Board = root.querySelector(".board.p1");
  const p2Board = root.querySelector(".board.p2");

  const fleetWrapper = root.querySelector(".fleet-wrapper");
  const fleetContainer = root.querySelector(".fleet-container");

  const resetBtn = root.querySelector(".reset");
  const randomBtn = root.querySelector(".random");
  const deployBtn = root.querySelector(".deploy");

  function getBoardFromPlayerName(playerName) {
    return p1Board.dataset.playername === playerName ? p1Board : p2Board;
  }

  function getFleetPositions() {
    const ships = fleetContainer.querySelectorAll(".ship-container");
    const map = new Map();

    ships.forEach((el) => {
      map.set(el, el.getBoundingClientRect());
    });

    return map;
  }

  function animateFleet(oldPositions) {
    const ships = fleetContainer.querySelectorAll(".ship-container");

    ships.forEach((shipEl) => {
      const oldRect = oldPositions.get(shipEl);
      if (!oldRect) return;

      const newRect = shipEl.getBoundingClientRect();

      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      if (dx === 0 && dy === 0) return;

      const segments = shipEl.querySelectorAll(".ship-segment");

      const transition = {
        normal: "cubic-bezier(0.22, 1, 0.36, 1)",
        bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      };

      segments.forEach((seg, i) => {
        seg.style.transform = `translate(${dx}px, ${dy}px)`;
        seg.style.transition = "transform 0s";

        requestAnimationFrame(() => {
          seg.style.transform = "";
          seg.style.transition = `transform 320ms ${transition.bouncy} ${i * 60}ms`;
        });
      });
    });
  }

  function createShipSVG(isHull, isPlayer2, hide) {
    const p2Class = isPlayer2 ? "p2" : "";
    const hideClass = hide ? "hide" : "";
    if (isHull) {
      return `
<svg class="hull ${p2Class} ${hideClass}" viewBox="0 0 90 80" fill="none">
  <path
    d="
      M15 65
      C15 30, 45 15, 80 20
      L80 65
      Z
    "
    stroke="currentColor"
    stroke-width="4"
    fill="none"
    stroke-linejoin="butt"
    stroke-linecap="butt"
  />
</svg>`;
    } else {
      return `
<svg class="body ${p2Class} ${hideClass}" viewBox="0 0 90 80">
  <rect
    x="8"
    y="12"
    stroke="currentColor"
    stroke-width="4"
    fill="none"
  />
</svg>`;
    }
  }

  function getCellElem(playerName, coords) {
    const boardElem = getBoardFromPlayerName(playerName);
    const [y, x] = coords;

    return boardElem.querySelector(`[data-coords="${y},${x}"]`);
  }

  function afterAnim(elem, callback) {
    elem.addEventListener("animationend", function func() {
      callback();
      elem.removeEventListener("animationend", func);
    });
  }

  function spawnImpactEffects(cellElem, isHit) {
    // Icon
    const icon = document.createElement("div");
    icon.className = isHit ? "hit-icon" : "miss-icon";
    icon.textContent = isHit ? "✖" : "O";
    cellElem.appendChild(icon);

    requestAnimationFrame(() => {
      icon.classList.add("icon-animate");
    });
    afterAnim(icon, () => {
      icon.remove();
    });

    // Shockwave
    const wave = document.createElement("div");
    wave.className = `shockwave ${isHit ? "hit" : "miss"}`;
    cellElem.appendChild(wave);

    requestAnimationFrame(() => {
      wave.classList.add("shockwave-animate");
    });
    afterAnim(wave, () => {
      wave.remove();
    });
  }

  function startShipPulse(boardElem, shipID) {
    const cells = boardElem.querySelectorAll(`.cell[data-shipid="${shipID}"]`);

    cells.forEach((cell, i) => {
      cell.classList.add("pulsing");
      cell.style.animationDelay = `${i * 200}ms`;
    });
  }

  function stopShipPulse(boardElem, shipID) {
    const cells = boardElem.querySelectorAll(`.cell[data-shipid="${shipID}"]`);

    cells.forEach((cell) => {
      cell.classList.remove("pulsing");
      cell.style.animationDelay = "";
    });
  }

  function playSunkAnimation(boardElem, shipID) {
    const cells = Array.from(
      boardElem.querySelectorAll(`.cell[data-shipid="${shipID}"]`),
    );

    if (!cells.length) return;

    // stop pulsing first
    stopShipPulse(boardElem, shipID);

    // small pause (important)
    setTimeout(() => {
      const flash = document.createElement("div");
      flash.classList.add("ship-flash");

      // position over ship bounds
      const rects = cells.map((c) => c.getBoundingClientRect());
      const minX = Math.min(...rects.map((r) => r.left));
      const maxX = Math.max(...rects.map((r) => r.right));
      const minY = Math.min(...rects.map((r) => r.top));
      const maxY = Math.max(...rects.map((r) => r.bottom));

      const boardRect = boardElem.getBoundingClientRect();

      const width = maxX - minX;
      const height = maxY - minY;

      flash.style.left = `${minX - boardRect.left}px`;
      flash.style.top = `${minY - boardRect.top}px`;
      flash.style.width = `${width}px`;
      flash.style.height = `${height}px`;

      boardElem.appendChild(flash);

      // elongate ellipse whether horizontal or vertical
      if (height > width) {
        flash.classList.add("vertical");
      }

      requestAnimationFrame(() => {
        flash.classList.add("flash-animate");
      });

      afterAnim(flash, () => {
        flash.remove();
      });
    }, 80);
  }

  return {
    eventElems: {
      p1Board,
      p2Board,
      fleetContainer,
      resetBtn,
      randomBtn,
      deployBtn,
    },

    initBoardPlayerNames(player1Name, player2Name) {
      p1Board.dataset.playername = player1Name;
      p2Board.dataset.playername = player2Name;
    },

    renderBoard(playerName, boardSize) {
      const boardElem = getBoardFromPlayerName(playerName);

      boardElem.textContent = "";

      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          const cellElem = document.createElement("div");
          cellElem.classList.add("cell");
          cellElem.dataset.coords = `${i},${j}`;

          boardElem.appendChild(cellElem);
        }
      }
    },

    // --- Setup Phase ---

    enterSetupPhase() {
      message.textContent = "Position Fleet";

      p2BoardWrapper.classList.add("hide");
      fleetContainer.classList.remove("hide");
      deployBtn.classList.remove("hide");
    },

    addPlaceableShip(shipID, shipLength = shipID + 1) {
      const shipContainer = document.createElement("div");
      shipContainer.classList.add("ship-container");
      shipContainer.dataset.shipid = shipID;

      for (let i = 0; i < shipLength; i++) {
        const shipSegment = document.createElement("div");
        shipSegment.classList.add("ship-segment");
        shipSegment.dataset.segmentnum = i;

        const isHull = i === shipLength - 1 ? true : false;
        shipSegment.innerHTML = createShipSVG(isHull);

        shipContainer.appendChild(shipSegment);
      }

      fleetContainer.appendChild(shipContainer);
    },

    removePlaceableShip(shipID) {
      const oldPositions = getFleetPositions();

      const shipContainer = fleetContainer.querySelector(
        `[data-shipid="${shipID}"]`,
      );

      shipContainer?.remove();

      requestAnimationFrame(() => {
        animateFleet(oldPositions);
      });
    },

    parseCellCoords(cellElem) {
      const coordsString = cellElem.dataset.coords;
      return coordsString.split(",").map((item) => +item);
    },

    removePreviousPreview(playerName) {
      const boardElem = getBoardFromPlayerName(playerName);
      const cells = boardElem.querySelectorAll(".preview");

      for (const cell of cells) {
        cell.classList.remove("preview", "invalid");
      }
    },

    updatePreview(playerName, coordsList, valid) {
      this.removePreviousPreview(playerName);
      for (let i = 0; i < coordsList.length; i++) {
        const coords = coordsList[i];
        const cellElem = getCellElem(playerName, coords);

        cellElem?.classList.add("preview");
        if (!valid) cellElem?.classList.add("invalid");
      }
    },

    selectShip(shipID) {
      const prevShipContainer = fleetContainer.querySelector(".floating");
      prevShipContainer?.classList.remove("floating");

      const shipContainer = fleetContainer.querySelector(
        `.ship-container[data-shipid="${shipID}"]`,
      );
      shipContainer.classList.add("floating");
    },

    placeShip(playerName, coordsList, shipID) {
      this.removePreviousPreview(playerName);

      const hullIsLast =
        p1Board.dataset.playername === playerName ? true : false;

      // Find original fleet ship (for animation source)
      const fleetShip = fleetContainer.querySelector(
        `.ship-container[data-shipid="${coordsList.length - 1}"]`,
      );

      let sourceRects = [];
      if (fleetShip) {
        const segments = fleetShip.querySelectorAll(".ship-segment");
        sourceRects = Array.from(segments).map((seg) =>
          seg.getBoundingClientRect(),
        );
      }

      for (let i = 0; i < coordsList.length; i++) {
        const coords = coordsList[i];

        let isHull = false;
        if (hullIsLast && i === coordsList.length - 1) isHull = true;
        if (!hullIsLast && i === 0) isHull = true;

        let isPlayer2 = playerName === p2Board.dataset.playername;
        let hideShip = isPlayer2;

        const cellElem = getCellElem(playerName, coords);

        // Create element but don't animate yet
        cellElem.classList.add("ship");
        cellElem.innerHTML = createShipSVG(isHull, isPlayer2, hideShip);
        cellElem.dataset.shipid = shipID;

        const segElem = cellElem.firstElementChild;

        if (sourceRects[i]) {
          const targetRect = cellElem.getBoundingClientRect();
          const sourceRect = sourceRects[i];

          const dx = sourceRect.left - targetRect.left;
          const dy = sourceRect.top - targetRect.top;

          segElem.style.translate = `${dx}px ${dy}px`;
          segElem.style.scale = "0.8";
          segElem.style.opacity = "0.25";

          requestAnimationFrame(() => {
            segElem.style.translate = "";
            segElem.style.scale = "";
            segElem.style.opacity = "";
            segElem.style.transition = `translate 400ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 70}ms, scale 400ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 70}ms, opacity 300ms ease ${i * 70}ms`;
          });
        }
      }
    },

    toggleVerticalShips() {
      const placeableShips = document.querySelectorAll(".ship-container");
      for (const ship of placeableShips) {
        if (ship.dataset.shipid === "0") continue;
        const hullIsLast = ship.lastChild.querySelector(".hull") ? true : false;
        if (hullIsLast) {
          ship.firstChild.innerHTML = createShipSVG(true);
          ship.lastChild.innerHTML = createShipSVG(false);
        } else {
          ship.firstChild.innerHTML = createShipSVG(false);
          ship.lastChild.innerHTML = createShipSVG(true);
        }
      }
      fleetContainer.classList.toggle("vertical");
    },

    // --- Battle Phase ---

    enterBattlePhase() {
      message.textContent = "Battle";

      p2BoardWrapper.classList.remove("hide");
      fleetWrapper.classList.add("hide");
      deployBtn.classList.add("hide");
    },

    hitCell(playerName, coords) {
      const cellElem = getCellElem(playerName, coords);
      const boardElem = getBoardFromPlayerName(playerName);

      const hasShip = cellElem.classList.contains("ship");

      spawnImpactEffects(cellElem, hasShip);

      cellElem.classList.add("hit");

      if (hasShip) {
        const shipID = cellElem.dataset.shipid;
        startShipPulse(boardElem, shipID);
      }
    },

    revealShip(receiverName, shipID) {
      const boardElem = getBoardFromPlayerName(receiverName);

      // play sunk animation FIRST
      playSunkAnimation(boardElem, shipID);

      setTimeout(() => {
        const shipCells = boardElem.querySelectorAll(
          `.cell[data-shipid="${shipID}"]`,
        );

        for (const cell of shipCells) {
          const shipSVG = cell.querySelector("svg");
          shipSVG.classList.remove("hide");
        }
      }, 200);
    },
  };
}
