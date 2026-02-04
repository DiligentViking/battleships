export function Controller(player1, player2, view) {
  //---Helpers---

  function getComputerMoves(board) {
    const moves = [];

    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      for (let j = 0; j < row.length; j++) {
        moves.push([i, j]);
      }
    }

    for (let i = moves.length - 1; i > 0; i--) {
      // Fisher-Yates shuffle
      const j = Math.floor(Math.random() * (i + 1));
      [moves[i], moves[j]] = [moves[j], moves[i]];
    }

    return moves;
  }

  function attackCell(coords, playerNum) {
    const player = playerNum === 1 ? player1 : player2;

    player.gameboard.receiveAttack(coords);
    view.renderBoard(player.gameboard.getBoard(), playerNum);
  }

  function checkGameEnd() {
    if (player1.gameboard.areAllShipsSunk()) {
      view.showWinner(2);
    } else if (player2.gameboard.areAllShipsSunk()) {
      view.showWinner(1);
    }
  }

  //---Flow---

  function init() {
    view.renderBoard(player1.gameboard.getBoard(), 1);
    view.renderBoard(player2.gameboard.getBoard(), 2);

    runPlayerSetup();
  }

  function runPlayerSetup() {
    const { placeShipInput } = view.eventElems;
    let shipLength = 1;
    let count = 1;

    placeShipInput.addEventListener("keyup", (e) => {
      if (e.key !== "Enter") return;

      const coords = view.validatePlaceShipInput();

      player1.gameboard.placeShip(count, shipLength, coords);
      view.renderBoard(player1.gameboard.getBoard(), 1);

      shipLength++;
      count++;

      view.showPlaceShipIcon(count);

      if (count === 7) {
        view.hideShipPlacer();
        if (player2.type === "computer") {
          runComputerSetup();
        }
      }
    });
  }

  function runComputerSetup() {
    let shipLength = 1;
    let count = 1;
    while (count !== 7) {
      const coords = [
        Math.round(Math.random() * 9),
        Math.round(Math.random() * 9),
      ];

      try {
        player2.gameboard.placeShip(count, shipLength, coords);
      } catch {
        continue;
      }

      view.renderBoard(player2.gameboard.getBoard(), 2);

      shipLength++;
      count++;
    }

    runGame();
  }

  function runGame() {
    const { p1Board, p2Board } = view.eventElems;

    const computerMoves =
      player2.type === "computer"
        ? getComputerMoves(player1.gameboard.getBoard())
        : undefined;

    let turn = 1;

    p2Board.addEventListener("click", (e) => {
      if (turn !== 1) return;
      if (e.target.tagName !== "BUTTON") return;

      const coords = view.parseCellCoords(e.target);
      if (player1.gameboard.getCell(coords).hit) return;
      attackCell(coords, 2);

      checkGameEnd();

      turn = 2;
      if (player2.type === "computer") {
        const move = computerMoves.pop();
        const cellToAttack = document.querySelector(
          `.p1-board > [data-coords='${move[0]},${move[1]}']`,
        );
        cellToAttack.click();
      }
    });

    p1Board.addEventListener("click", (e) => {
      if (turn !== 2) return;
      if (e.target.tagName !== "BUTTON") return;

      const coords = view.parseCellCoords(e.target);
      attackCell(coords, 1);

      checkGameEnd();

      turn = 1;
    });
  }

  return {
    init,
  };
}
