export function Controller(player1, player2, game, view) {
  function init() {
    view.initBoardPlayerNames(player1.getName(), player2.getName());

    view.renderBoard(player1.gameboard.getBoard(), player1.getName());
    view.renderBoard(player2.gameboard.getBoard(), player2.getName());

    runPlayerSetup();
  }

  function runPlayerSetup(numShips = 6) {
    const { placeShipInput } = view.eventElems;
    let count = 0;

    placeShipInput.addEventListener("keyup", (e) => {
      if (e.key !== "Enter") return;

      const shipID = count;
      const shipLength = count + 1;
      const coords = view.validatePlaceShipInput();

      player1.gameboard.placeShip(shipID, shipLength, coords);
      view.renderBoard(player1.gameboard.getBoard(), player1.getName());

      count++;

      view.showPlaceShipIcon(count);

      if (count === numShips) {
        view.hideShipPlacer();
        if (player2.getType() === "computer") {
          runComputerSetup();
        }
      }
    });
  }

  function runComputerSetup(numShips = 6) {
    let count = 0;

    while (count !== numShips) {
      const shipID = count;
      const shipLength = count + 1;
      const coords = [
        Math.floor(Math.random() * player2.gameboard.getBoardHeight()),
        Math.floor(Math.random() * player2.gameboard.getBoardWidth()),
      ];

      try {
        player2.gameboard.placeShip(shipID, shipLength, coords);
      } catch {
        continue;
      }

      view.renderBoard(player2.gameboard.getBoard(), player2.getName());

      count++;
    }

    runGame();
  }

  function runGame() {
    const { p1Board, p2Board } = view.eventElems;

    function attackCell(receiverName, coords = null) {
      try {
        game.attack(receiverName, coords);
      } catch (err) {
        console.error(err);
      }

      const receiver = player1.getName() === receiverName ? player1 : player2;
      const receiverBoard = receiver.gameboard.getBoard();

      view.renderBoard(receiverBoard, receiverName);

      const status = game.getState();
      if (status.winner) {
        const winNum = status.winner === player1.getName() ? 1 : 2;
        view.showWinner(winNum);
        return;
      }

      if (receiver.getType() === "computer") {
        const newReceiver =
          player1.getName() === receiverName ? player2 : player1;
        attackCell(newReceiver.getName());
      }
    }

    function onBoardClick(e) {
      if (e.target.tagName !== "BUTTON") return;

      const coords = view.parseCellCoords(e.target);
      const receiverName = this.dataset.playername;

      attackCell(receiverName, coords);
    }

    if (player1.getType() === "computer") attackCell(player2.getName());

    p1Board.addEventListener("click", onBoardClick);
    p2Board.addEventListener("click", onBoardClick);
  }

  return {
    init,
  };
}
