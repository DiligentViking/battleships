export function Controller(player1, player2, game, view) {
  //---Helpers---

  function updateCells(player, coordsList) {
    const playerName = player.getName();
    for (const coords of coordsList) {
      const cellData = player.gameboard.getCell(coords);
      view.updateCell(playerName, coords, cellData);
    }
  }

  //---Flow---

  function init() {
    view.initBoardPlayerNames(player1.getName(), player2.getName());

    view.renderBoard(
      player1.getName(),
      player1.gameboard.getBoardHeight(),
      player1.gameboard.getBoardWidth(),
    );
    view.renderBoard(
      player2.getName(),
      player2.gameboard.getBoardHeight(),
      player2.gameboard.getBoardWidth(),
    );

    runPlayerSetup();
  }

  // function runPlayerSetup(numShips = 6) {
  //   const { placeShipInput } = view.eventElems;
  //   let count = 0;

  //   placeShipInput.addEventListener("keyup", (e) => {
  //     if (e.key !== "Enter") return;

  //     const shipID = count;
  //     const shipLength = count + 1;
  //     const coords = view.validatePlaceShipInput();
  //     let coordsList;

  //     coordsList = player1.gameboard.placeShip(shipID, shipLength, coords);
  //     updateCells(player1, coordsList);

  //     count++;

  //     view.showPlaceShipIcon(count);

  //     if (count === numShips) {
  //       view.hideShipPlacer();
  //       if (player2.getType() === "computer") {
  //         runComputerSetup();
  //       }
  //     }
  //   });
  // }

  function runPlayerSetup(numShips = 6) {
    let count = 0;

    while (count !== numShips) {
      const shipID = count;
      const shipLength = count + 1;
      const coords = [
        Math.floor(Math.random() * player1.gameboard.getBoardHeight()),
        Math.floor(Math.random() * player1.gameboard.getBoardWidth()),
      ];
      let coordsList;

      try {
        coordsList = player1.gameboard.placeShip(shipID, shipLength, coords);
      } catch {
        continue;
      }

      updateCells(player1, coordsList);

      count++;
    }

    view.hideShipPlacer();

    if (player2.getType() === "computer") {
      runComputerSetup();
    }
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
      let coordsList;

      try {
        coordsList = player2.gameboard.placeShip(shipID, shipLength, coords);
      } catch {
        continue;
      }

      updateCells(player2, coordsList);

      count++;
    }

    runGame();
  }

  function runGame() {
    function attackCell(receiverName, coords = null) {
      try {
        coords = game.attack(receiverName, coords);
      } catch (err) {
        console.error(err);
        return;
      }

      const receiver = player1.getName() === receiverName ? player1 : player2;
      const cellData = receiver.gameboard.getCell(coords);

      view.updateCell(receiverName, coords, cellData);

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

    const { p1Board, p2Board } = view.eventElems;

    if (player1.getType() === "computer") attackCell(player2.getName());

    p1Board.addEventListener("click", onBoardClick);
    p2Board.addEventListener("click", onBoardClick);
  }

  return {
    init,
  };
}
