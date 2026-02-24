export function View(root) {
  const shipPlacer = root.querySelector(".ship-placer");
  const placeShipLabel = root.querySelector("label[for='place-ship']");
  const placeShipInput = root.querySelector("#place-ship");
  const p1Board = root.querySelector(".p1-board");
  const p2Board = root.querySelector(".p2-board");
  const p1Result = root.querySelector(".p1-result");
  const p2Result = root.querySelector(".p2-result");

  const SHIPICONS = ["🛶", "🛥️", "⛵", "🛳️", "⛴️", "🚢"];

  function renderCell(cellData, cellElem) {
    if (cellData.shipID === null) {
      cellElem.textContent = cellData.hit ? "m" : " ";
    } else {
      cellElem.textContent = cellData.hit
        ? "x"
        : (SHIPICONS[cellData.shipID] ?? "S");
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

    renderBoard(board, playerName) {
      const boardElem =
        p1Board.dataset.playername === playerName ? p1Board : p2Board;

      boardElem.textContent = "";

      for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
          const cell = board[i][j];

          const cellElem = document.createElement("button");
          cellElem.dataset.coords = `${i},${j}`;

          renderCell(cell, cellElem);

          boardElem.appendChild(cellElem);
        }
      }
    },

    updateCell(playerName, coords, cellData) {
      const boardElem =
        p1Board.dataset.playername === playerName ? p1Board : p2Board;
      const [y, x] = coords;
      const cellElem = boardElem.querySelector(`[data-coords="${y},${x}"]`);

      renderCell(cellData, cellElem);
    },

    showWinner(winNum) {
      const playerResultElem = winNum === 1 ? p1Result : p2Result;
      playerResultElem.textContent = "you win";
    },
  };
}
