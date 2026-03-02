export function View(root) {
  const shipPlacer = root.querySelector(".ship-placer");
  const placeShipLabel = root.querySelector("label[for='place-ship']");
  const placeShipInput = root.querySelector("#place-ship");
  const p1Board = root.querySelector(".p1-board");
  const p2Board = root.querySelector(".p2-board");
  const p1Result = root.querySelector(".p1-result");
  const p2Result = root.querySelector(".p2-result");

  const SHIPICONS = ["🛶", "🛥️", "⛵", "🛳️", "⛴️", "🚢"];

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
    stroke-width="6"
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
    stroke-width="6"
    fill="none"
  />
</svg>`;
    }
  }

  return {
    eventElems: { placeShipInput, p1Board, p2Board }, // Controller only uses these for addEventListener

    showPlaceShipIcon(shipID) {
      placeShipLabel.textContent = "Place Ship: " + (SHIPICONS[shipID] ?? "S");
    },

    validatePlaceShipInput() {
      const inputCoords = placeShipInput.value;

      const commaDelimited = inputCoords.split(",");
      const spaceDelimited = inputCoords.split(" ");

      const coords =
        commaDelimited.length === 2
          ? [+commaDelimited[0], +commaDelimited[1]]
          : spaceDelimited.length === 2
            ? [+spaceDelimited[0], +spaceDelimited[1]]
            : -1;

      if (coords === -1) throw new Error("Invalid coords format");

      return coords;
    },

    parseCellCoords(cellElem) {
      const coordsString = cellElem.dataset.coords;
      return coordsString.split(",").map((item) => +item);
    },

    hideShipPlacer() {
      shipPlacer.classList.add("hide");
    },

    initBoardPlayerNames(player1Name, player2Name) {
      p1Board.dataset.playername = player1Name;
      p2Board.dataset.playername = player2Name;
    },

    renderBoard(playerName, height, width) {
      const boardElem =
        p1Board.dataset.playername === playerName ? p1Board : p2Board;

      boardElem.textContent = "";

      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const cellElem = document.createElement("div");
          cellElem.classList.add("cell");
          cellElem.dataset.coords = `${i},${j}`;

          boardElem.appendChild(cellElem);
        }
      }
    },

    updateCell(playerName, coords, cellData, isHull) {
      const boardElem =
        p1Board.dataset.playername === playerName ? p1Board : p2Board;
      const [y, x] = coords;
      const cellElem = boardElem.querySelector(`[data-coords="${y},${x}"]`);

      if (cellData.shipID === null) {
        cellElem.textContent = cellData.hit ? "m" : " ";
      } else {
        cellElem.innerHTML = createShipSVG(isHull);
      }
    },

    showWinner(winNum) {
      const playerResultElem = winNum === 1 ? p1Result : p2Result;
      playerResultElem.textContent = "you win";
    },
  };
}
