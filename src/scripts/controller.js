export function Controller(player1, player2, view) {
  return {
    init() {
      view.renderBoard(player1.gameboard.getBoard(), 1);
      view.renderBoard(player2.gameboard.getBoard(), 2);

      this.runPlayerSetup();
    },

    runPlayerSetup() {
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
            this.runComputerSetup();
          }
        }
      });
    },

    runComputerSetup() {
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

      this.runGame();
    },

    checkGameEnd() {
      if (player1.gameboard.areAllShipsSunk()) {
        view.showWinner(2);
      } else if (player2.gameboard.areAllShipsSunk()) {
        view.showWinner(1);
      }
    },

    runGame() {
      const attackCell = (cellElem, playerNum) => {
        const player = playerNum === 1 ? player1 : player2;
        const coords = cellElem.dataset.coord.split(",");

        player.gameboard.receiveAttack(coords);
        view.renderBoard(player.gameboard.getBoard(), playerNum);

        this.checkGameEnd();
      };

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
        // Fisher-Yates shuffle found online
        (() => {
          const array = computerMoves;
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        })();
      }

      p2Board.addEventListener("click", (e) => {
        if (turn !== 1) return;
        if (e.target.tagName !== "BUTTON") return;
        if (["m", "x"].includes(e.target.textContent)) return; // TODO: fix coupledness

        attackCell(e.target, 2);

        turn = 2;
        if (player2.type !== "computer") return;
        const move = computerMoves.pop();
        const cellToAttack = document.querySelector(
          `.p1-board > [data-coord='${move[0]},${move[1]}']`,
        );
        cellToAttack.click();
      });

      p1Board.addEventListener("click", (e) => {
        if (turn !== 2) return;
        if (e.target.tagName !== "BUTTON") return;

        attackCell(e.target, 1);

        turn = 1;
      });
    },
  };
}
