export function View(root) {
  const p1Board = root.querySelector(".p1-board");
  const p2Board = root.querySelector(".p2-board");
  return {
    renderBoard(board, playerNum) {
      const shipIcons = [" ", "🛶", "🛥️", "⛵", "🛳️", "⛴️", "🚢"];
      const boardElem = playerNum === 1 ? p1Board : p2Board;
      for (const row of board) {
        for (const cell of row) {
          const cellElem = document.createElement("button");
          cellElem.textContent = shipIcons[cell];
          boardElem.appendChild(cellElem);
        }
      }
    },
  };
}
