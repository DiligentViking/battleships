export function Controller(player1, player2, game, view) {
  //---Helpers---

  const NUM_SHIPS = 6;
  const SHIP_LENGTHS = [1, 2, 3, 4, 5, 6];
  // const SHIP_LENGTHS = [1, 1, 1, 1, 1, 1];  // dev

  function resetSetup(player, numShips) {
    player.gameboard.unplaceAllShips();

    view.renderBoard(player.getName(), player.gameboard.getBoardSize());

    for (let i = 0; i < numShips; i++) {
      view.removePlaceableShip(i);
      view.addPlaceableShip(i);
    }
  }

  function autoPlaceShips(player, numShips) {
    let count = 0;
    let f = 0;

    while (count !== numShips) {
      if (f++ > 200) {
        console.log("FIREBREAK");
        resetSetup(player, numShips);
        count = 0;
        f = 0;
      }
      const shipID = count;
      const shipLength = SHIP_LENGTHS[shipID];
      const coords = [
        Math.floor(Math.random() * player.gameboard.getBoardSize()),
        Math.floor(Math.random() * player.gameboard.getBoardSize()),
      ];
      const isVertical = Math.round(Math.random()) ? true : false;

      const { coordsList, valid } = player.gameboard.placeShip(
        shipID,
        shipLength,
        coords,
        isVertical,
      );

      if (!valid) continue;

      view.removePlaceableShip(shipID);
      view.placeShip(player.getName(), coordsList);

      count++;
    }
  }

  //---Flow---

  function init() {
    view.initBoardPlayerNames(player1.getName(), player2.getName());

    if (player1.getType() === "computer") {
      player1.initComputerTargets(player2.gameboard.getBoardSize());
    }
    if (player2.getType() === "computer") {
      player2.initComputerTargets(player1.gameboard.getBoardSize());
    }

    view.renderBoard(player1.getName(), player1.gameboard.getBoardSize());
    view.renderBoard(player2.getName(), player1.gameboard.getBoardSize());

    runPlayerSetup();
  }

  function runPlayerSetup() {
    view.enterSetupPhase();

    for (let i = 0; i < NUM_SHIPS; i++) {
      view.addPlaceableShip(i);
    }

    // Drag Events

    const { p1Board, fleetContainer } = view.eventElems;
    let heldShipID = null;
    let heldSegmentNum = null;
    let isVertical = false;
    let currentHoverEvent = null;

    function onShipMousedown(e) {
      if (!e.target.parentNode.classList.contains("ship-segment")) return;

      const shipSegment = e.target.parentNode;
      heldSegmentNum = +shipSegment.dataset.segmentnum;
      heldShipID = +shipSegment.parentNode.dataset.shipid;

      view.selectShip(heldShipID);
    }

    function onBoardMouseover(e) {
      if (heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      currentHoverEvent = e;

      const coords = view.parseCellCoords(e.target);

      if (isVertical) coords[0] = coords[0] - heldSegmentNum;
      else coords[1] = coords[1] - heldSegmentNum;

      const result = player1.gameboard.getPreview(
        heldShipID,
        heldShipID + 1,
        coords,
        isVertical,
      );
      const { coordsList, valid } = result;

      view.updatePreview(player1.getName(), coordsList, valid);
    }

    function onBoardMouseup(e) {
      if (heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      const coords = view.parseCellCoords(e.target);

      if (isVertical) coords[0] = coords[0] - heldSegmentNum;
      else coords[1] = coords[1] - heldSegmentNum;

      const result = player1.gameboard.placeShip(
        heldShipID,
        heldShipID + 1,
        coords,
        isVertical,
      );
      const { coordsList, valid } = result;

      if (!valid) return;

      view.placeShip(player1.getName(), coordsList);
      view.removePlaceableShip(heldShipID);

      heldShipID = null;
    }

    function onBoardMouseleave() {
      currentHoverEvent = null;
      view.removePreviousPreview(player1.getName());
    }

    function onKeydown(e) {
      if (e.key === "d") player1.gameboard._logBoard();
      if (e.key !== "r") return;
      isVertical = isVertical === true ? false : true;
      view.toggleVerticalShips();
      onBoardMouseover(currentHoverEvent);
    }

    document.addEventListener("dragstart", (e) => e.preventDefault());
    fleetContainer.addEventListener("mousedown", onShipMousedown);
    p1Board.addEventListener("mouseover", onBoardMouseover);
    p1Board.addEventListener("mouseup", onBoardMouseup);
    p1Board.addEventListener("mouseleave", onBoardMouseleave);
    window.addEventListener("keydown", onKeydown);

    // Button Events

    const { resetBtn, randomBtn, deployBtn } = view.eventElems;

    resetBtn.addEventListener("click", () => {
      resetSetup(player1, NUM_SHIPS);
    });

    randomBtn.addEventListener("click", () => {
      resetSetup(player1, NUM_SHIPS);
      autoPlaceShips(player1, NUM_SHIPS);
    });

    deployBtn.addEventListener("click", () => {
      if (player2.getType() === "computer") {
        runComputerSetup();
      }

      view.enterBattlePhase();

      runGame();
    });

    // randomBtn.click(); // dev
    // deployBtn.click(); // dev
  }

  function runComputerSetup() {
    autoPlaceShips(player2, NUM_SHIPS);
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
        console.log(`${winNum}, wins.`);
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

    // Autoplay (dev)
    function autoplay() {
      let x = 0;
      let y = 0;
      setInterval(() => {
        p2Board.querySelector(`.cell[data-coords="${x},${y}"]`).click();
        x++;
        if (x === 10) {
          x = 0;
          y++;
        }
      }, 750);
    }

    autoplay;
    // autoplay(); // dev
  }

  return {
    init,
  };
}
