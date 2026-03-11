export function Controller(player1, player2, game, view) {
  //---Helpers---

  function resetSetup(numShips) {
    player1.gameboard.unplaceAllShips();

    view.renderBoard(
      player1.getName(),
      player1.gameboard.getBoardHeight(),
      player1.gameboard.getBoardWidth(),
    );

    for (let i = 0; i < numShips; i++) {
      view.removePlaceableShip(i);
      view.addPlaceableShip(i);
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

    for (let i = 0; i < numShips; i++) {
      view.addPlaceableShip(i);
    }

    // Drag Events

    const { p1Board, fleetContainer } = view.eventElems;
    let heldShipID = null;

    document.addEventListener("dragstart", (e) => e.preventDefault());

    fleetContainer.addEventListener("mousedown", (e) => {
      if (!e.target.parentNode.classList.contains("ship-segment")) return;

      const shipSegment = e.target.parentNode;

      heldShipID = +shipSegment.parentNode.dataset.shipid;

      console.log(heldShipID);
    });

    p1Board.addEventListener("mouseover", (e) => {
      if (heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      const coords = view.parseCellCoords(e.target);

      const result = player1.gameboard.getPreview(heldShipID + 1, coords);
      const { coordsList, valid } = result;

      view.updatePreview(player1.getName(), coordsList, valid);
    });

    p1Board.addEventListener("mouseup", (e) => {
      if (heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      const coords = view.parseCellCoords(e.target);

      const coordsList = player1.gameboard.placeShip(
        heldShipID,
        heldShipID + 1,
        coords,
      );

      view.placeShip(player1.getName(), coordsList);
      view.removePlaceableShip(heldShipID);

      heldShipID = null;
    });

    p1Board.addEventListener("mouseleave", () => {
      view.removePreviousPreview();
    });

    // Button Events

    const { resetBtn, randomBtn } = view.eventElems;

    resetBtn.addEventListener("click", () => {
      resetSetup(numShips);
    });

    randomBtn.addEventListener("click", () => {
      resetSetup(numShips);

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

        view.removePlaceableShip(shipID);
        view.placeShip(player1.getName(), coordsList);

        count++;
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
        // const winNum = status.winner === player1.getName() ? 1 : 2;
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
