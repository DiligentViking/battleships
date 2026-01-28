export function Controller(player1, player2, view) {
  return {
    init() {
      view.renderBoard(player1.gameboard.getBoard(), 1);
      view.renderBoard(player2.gameboard.getBoard(), 2);

      this.runGame();
    },

    runGame() {
      function attackCell(cellElem, playerNum) {
        const player = playerNum === 1 ? player1 : player2;
        const coords = cellElem.dataset.coord.split(",");
        const board = player.gameboard.getBoard();

        player.gameboard.receiveAttack(coords);
        view.renderBoard(board, playerNum);
      }

      let turn = 1;
      const { p1Board, p2Board } = view.eventElems;

      const computerMoves = [];
      if (player2.type === "computer") {
        const board1 = player1.gameboard.getBoard();
        for (let i = 0; i < board1.length; i++) {
          const row = board1[i];
          for (let j = 0; j < row.length; j++) {
            computerMoves.push([i, j]);
          }
        }
      }

      p2Board.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") return;
        if (turn !== 1) return;

        attackCell(e.target);

        turn = 2;
        if (player2.type !== "computer") return;
        const move =
          computerMoves[Math.round(Math.random() * computerMoves.length)];
        const cellToAttack = document.querySelector(
          `.p1-board > [data-coord='${move[0]},${move[1]}']`,
        );
        cellToAttack.click();
      });

      p1Board.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") return;
        if (turn !== 2) return;

        attackCell(e.target);

        turn = 1;
      });
    },
  };
}
