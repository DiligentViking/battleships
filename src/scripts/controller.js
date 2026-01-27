export function Controller(player1, player2, view) {
  return {
    init() {
      let board1 = player1.gameboard.getBoard();
      let board2 = player2.gameboard.getBoard();
      view.renderBoard(board1, 1);
      view.renderBoard(board2, 2);

      function onBoardClick(playerNum) {
        const boardElem = playerNum === 1 ? p1Board : p2Board;
        const player = playerNum === 1 ? player1 : player2;
        boardElem.addEventListener("click", (e) => {
          if (e.target.tagName === "BUTTON") {
            const coords = e.target.dataset.coord.split(",");
            player.gameboard.receiveAttack(coords);
            const board = player.gameboard.getBoard();
            view.renderBoard(board, playerNum);
            if (turn === 1) {
              turn = 2;
              if (player2.type === "computer") {
                const move =
                  computerMoves[Math.round(Math.random() * computerMoves.length)];
                document
                  .querySelector(
                    `.p1-board > [data-coord='${move[0]},${move[1]}']`,
                  )
                  .click();
                turn = 1;
              }
            }
          }
        });
      }

      let turn = 1;
      const { p1Board, p2Board } = view.eventElems;
      onBoardClick(1);
      onBoardClick(2);

      const computerMoves = [];
      if (player2.type === "computer") {
        for (let i = 0; i < board1.length; i++) {
          const row = board1[i];
          for (let j = 0; j < row.length; j++) {
            computerMoves.push([i, j]);
          }
        }
      }
    },
  };
}
