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

  // --- FLIP HELPERS (PER-SEGMENT RIPPLE) ---

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

  function createShipSVG(isHull) {
    if (isHull) {
      return `
<svg class="hull" viewBox="0 0 90 80" fill="none">
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
<svg class="body" viewBox="0 0 90 80">
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
      fleetWrapper.classList.remove("hide");
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

    placeShip(playerName, coordsList) {
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

        const cellElem = getCellElem(playerName, coords);

        // Create element but don't animate yet
        cellElem.classList.add("ship");
        cellElem.innerHTML = createShipSVG(isHull);

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

      if (cellElem.classList.contains("ship")) {
        cellElem.classList.add("hit");
      } else {
        cellElem.classList.add("miss");
      }
    },
  };
}
