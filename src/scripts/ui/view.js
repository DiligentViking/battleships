export function View(root) {
  const message = root.querySelector(".message");

  const p1BoardWrapper = root.querySelector(".board-wrapper.p1");
  const p2BoardWrapper = root.querySelector(".board-wrapper.p2");
  const p1Board = root.querySelector(".board.p1");
  const p2Board = root.querySelector(".board.p2");

  const shipsContainer = root.querySelector(".ships-container");
  shipsContainer.style.outline = "2px solid red";

  const deployBtn = root.querySelector(".deploy");

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
    const boardElem =
      p1Board.dataset.playername === playerName ? p1Board : p2Board;
    const [y, x] = coords;

    return boardElem.querySelector(`[data-coords="${y},${x}"]`);
  }

  return {
    eventElems: { p1Board, p2Board }, // Controller only uses these for addEventListener

    //---Player/Board Init---

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

    //---Setup Phase---

    enterSetupPhase() {
      message.textContent = "Position Fleet";

      p2BoardWrapper.classList.add("hide");
      shipsContainer.classList.remove("hide");
      deployBtn.classList.remove("hide");
    },

    parseCellCoords(cellElem) {
      const coordsString = cellElem.dataset.coords;
      return coordsString.split(",").map((item) => +item);
    },
    placeShipCell(playerName, coords, shipID, isHull) {
      const cellElem = getCellElem(playerName, coords);

      cellElem.classList.add("ship");
      cellElem.innerHTML = createShipSVG(isHull);
    },

    //---Battle Phase---

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
