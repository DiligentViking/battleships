export function View(root) {
  const shipPlacer = root.querySelector(".ship-placer");
  const placeShipLabel = root.querySelector("label[for='place-ship']");
  const placeShipInput = root.querySelector("#place-ship");
  const p1Board = root.querySelector(".p1-board");
  const p2Board = root.querySelector(".p2-board");
  const p1Result = root.querySelector(".p1-result");
  const p2Result = root.querySelector(".p2-result");

  const SHIPICONS = [" ", "🛶", "🛥️", "⛵", "🛳️", "⛴️", "🚢"];

  return {
    eventElems: { placeShipInput, p1Board, p2Board }, // Controller only uses these for addEventListener

    showPlaceShipIcon(shipID) {
      placeShipLabel.textContent = "Place Ship: " + SHIPICONS[shipID];
    },

    hideShipPlacer() {
      shipPlacer.classList.add("hide");
    },

    renderBoard(board, playerNum) {
      const boardElem = playerNum === 1 ? p1Board : p2Board;

      boardElem.textContent = "";

      for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
          const cell = board[i][j];

          const cellElem = document.createElement("button");
          cellElem.dataset.coord = `${i},${j}`;

          if (cell.shipID === 0) {
            cellElem.textContent = cell.hit ? "m" : " ";
          } else {
            cellElem.textContent = cell.hit ? "x" : SHIPICONS[cell.shipID];
          }

          boardElem.appendChild(cellElem);
        }
      }
    },

    showWinner(playerNum) {
      const playerResultElem = playerNum === 1 ? p1Result : p2Result;
      playerResultElem.textContent = "you win";
    },
  };
}
