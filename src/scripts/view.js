export function View(root) {
  const p1Board = root.querySelector(".p1-board");
  const p2Board = root.querySelector(".p2-board");
  return {
    eventElems: {p1Board, p2Board},
    renderBoard(board, playerNum) {
      const shipIcons = [" ", "🛶", "🛥️", "⛵", "🛳️", "⛴️", "🚢"];
      const boardElem = playerNum === 1 ? p1Board : p2Board;
      boardElem.textContent = '';
      for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
          const cell = board[i][j];
          const cellElem = document.createElement("button");
          cellElem.textContent = shipIcons[cell] ?? cell;
          cellElem.dataset.coord = `${i},${j}`;
          boardElem.appendChild(cellElem);
        }
      }
    },
  };
}
