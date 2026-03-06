export function Controller(player1, player2, game, view) {
  //---Helpers---

  function updateCells(player, coordsList) {
    const playerName = player.getName();
    const hullIsLast = playerName === player1.getName() ? true : false;
    
    for (let i = 0; i < coordsList.length; i++) {
      const coords = coordsList[i];
      const cellData = player.gameboard.getCell(coords);

      let isHull = false;
      if (hullIsLast && i === coordsList.length - 1) isHull = true;
      if (!hullIsLast && i === 0) isHull = true;

      view.placeShipCell(playerName, coords, cellData.shipID, isHull);
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

  function runPlayerSetup(numShips = 6) {
    view.enterSetupPhase();
  }

  // function runPlayerSetup(numShips = 6) {
  //   let count = 0;

  //   while (count !== numShips) {
  //     const shipID = count;
  //     const shipLength = count + 1;
  //     const coords = [
  //       Math.floor(Math.random() * player1.gameboard.getBoardHeight()),
  //       Math.floor(Math.random() * player1.gameboard.getBoardWidth()),
  //     ];
  //     let coordsList;

  //     try {
  //       coordsList = player1.gameboard.placeShip(shipID, shipLength, coords);
  //     } catch {
  //       continue;
  //     }

  //     updateCells(player1, coordsList);

  //     count++;
  //   }

  //   view.hideShipPlacer();

  //   if (player2.getType() === "computer") {
  //     runComputerSetup();
  //   }
  // }

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

      view.hitCell(receiverName, coords);

      const status = game.getState();
      if (status.winner) {
        const winNum = status.winner === player1.getName() ? 1 : 2;
        return;
      }

      if (receiver.getType() === "computer") {
        const newReceiver =
          player1.getName() === receiverName ? player2 : player1;
        attackCell(newReceiver.getName());
      }
    }

    function onBoardClick(e) {
      if (!e.target.classList.contains("cell")) return;

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
