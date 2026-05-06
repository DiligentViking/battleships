import { DEV } from "../dev.js";
import { sleep } from "../models/utils.js";

export function Controller(player1, player2, game, view, config = {}, sound) {
  const CONFIG = {
    NUM_SHIPS: 6,
    SHIP_LENGTHS: [1, 2, 3, 4, 5, 6],

    HIT_DELAY: DEV.enabled ? DEV.delays.hit : 800,
    COMPUTER_DELAY: DEV.enabled ? DEV.delays.computer : 600,
    AUTOPLAY_DELAY: DEV.enabled ? DEV.delays.autoplay : 250,
  };

  let cleanupFns = [];

  // ====================
  // INIT
  // ====================

  function init() {
    sound.music.setup();

    setupPlayers();
    renderBoards();

    if (DEV.enabled && config.devStartAt === "battle") {
      startDevBattlePhase();
      return;
    }

    startSetupPhase();
  }

  function setupPlayers() {
    view.initBoardPlayerNames(player1.getName(), player2.getName());

    if (player1.getType() === "computer") {
      player1.initComputerTargets(player2.gameboard.getBoardSize());
    }
    if (player2.getType() === "computer") {
      player2.initComputerTargets(player1.gameboard.getBoardSize());
    }
  }

  function renderBoards() {
    const size = player1.gameboard.getBoardSize();
    view.renderBoard(player1.getName(), size);
    view.renderBoard(player2.getName(), size);
  }

  // ====================
  // SETUP PHASE
  // ====================

  function startDevBattlePhase() {
    view.enterSetupPhase();

    for (let i = 0; i < CONFIG.NUM_SHIPS; i++) {
      view.addPlaceableShip(i);
    }

    autoPlace(player1);

    if (player2.getType() === "computer") {
      autoPlace(player2);
    }

    view.enterBattlePhase();
    startBattlePhase();
  }

  function startSetupPhase() {
    clearListeners();

    const setup = createSetupController();
    setup.init();
  }

  function createSetupController() {
    const state = {
      heldShipID: null,
      heldSegment: null,
      isVertical: false,
      hoverEvent: null,
      placedShips: new Set(),
      deploying: false,
    };

    const { p1Board, fleetContainer, resetBtn, randomBtn, deployBtn } =
      view.eventElems;

    function init() {
      view.setAmbientPhase("setup-phase");
      view.enterSetupPhase();
      view.setDeployReady(false);

      for (let i = 0; i < CONFIG.NUM_SHIPS; i++) {
        view.addPlaceableShip(i);
      }

      bindEvents();

      if (DEV.enabled && DEV.autoRandomizeFleet) randomBtn.click();
      if (DEV.enabled && DEV.autoDeployFleet) deployBtn.click();
    }

    function bindEvents() {
      addListener(fleetContainer, "mousedown", onShipGrab);
      addListener(p1Board, "mouseover", onBoardHover);
      addListener(p1Board, "mouseup", onBoardDrop);
      addListener(p1Board, "mouseleave", onLeaveBoard);
      addListener(window, "keydown", onKeyRotate);

      addListener(resetBtn, "click", reset);
      addListener(randomBtn, "click", randomize);
      addListener(deployBtn, "click", deploy);

      bindButtonHover(resetBtn);
      bindButtonHover(randomBtn);
      bindButtonHover(deployBtn);

      addListener(document, "dragstart", (e) => e.preventDefault());
    }

    function onShipGrab(e) {
      if (!e.target.classList.contains("ship-segment")) return;

      state.heldSegment = +e.target.dataset.segmentnum;
      state.heldShipID = +e.target.parentNode.dataset.shipid;

      view.selectShip(state.heldShipID);
    }

    function onBoardHover(e) {
      if (state.heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      state.hoverEvent = e;

      const coords = adjustCoords(e);

      const { coordsList, valid } = player1.gameboard.getPreview(
        state.heldShipID,
        state.heldShipID + 1,
        coords,
        state.isVertical,
      );

      view.playCellHoverSound(valid ? "valid" : "invalid");
      view.updatePreview(player1.getName(), coordsList, valid);
    }

    function onBoardDrop(e) {
      if (state.heldShipID === null) return;
      if (!e.target.classList.contains("cell")) return;

      const shipID = state.heldShipID;
      const coords = adjustCoords(e);

      const { coordsList, valid } = player1.gameboard.placeShip(
        shipID,
        CONFIG.SHIP_LENGTHS[shipID],
        coords,
        state.isVertical,
      );

      if (!valid) return;

      view.placeShip(player1.getName(), coordsList, shipID, state.isVertical);
      view.removePlaceableShip(shipID);

      state.placedShips.add(shipID);
      updateDeployState();

      state.heldShipID = null;
    }

    function onLeaveBoard() {
      state.hoverEvent = null;
      view.clearPreview(player1.getName());
      view.clearHoverSoundTimeout();
    }

    function onKeyRotate(e) {
      if (e.key === "r") {
        state.isVertical = !state.isVertical;
        view.toggleVerticalShips(state.isVertical);
        if (state.hoverEvent) onBoardHover(state.hoverEvent);
      }
    }

    function reset() {
      if (state.isVertical) {
        state.isVertical = false;
        view.toggleVerticalShips(state.isVertical);
      }

      resetSetup(player1);

      state.heldShipID = null;
      state.heldSegment = null;
      state.hoverEvent = null;
      state.placedShips.clear();

      updateDeployState();
    }

    function randomize() {
      view.playPlaceRandomSound();
      resetSetup(player1);
      autoPlace(player1);

      state.heldShipID = null;
      state.heldSegment = null;
      state.hoverEvent = null;
      state.placedShips = new Set(
        Array.from({ length: CONFIG.NUM_SHIPS }, (_, i) => i),
      );

      updateDeployState();
    }

    async function deploy() {
      if (!isFleetReady() || state.deploying) return;

      state.deploying = true;
      deployBtn.disabled = true;

      if (player2.getType() === "computer") {
        autoPlace(player2);
      }

      view.playDeploySound();

      sound.music.stop({});

      await view.playDeployTransition();

      startBattlePhase();
    }

    function updateDeployState() {
      view.setDeployReady(isFleetReady());
    }

    function isFleetReady() {
      return state.placedShips.size === CONFIG.NUM_SHIPS;
    }

    function adjustCoords(e) {
      const coords = view.parseCellCoords(e.target);

      if (state.isVertical) coords[0] -= state.heldSegment;
      else coords[1] -= state.heldSegment;

      return coords;
    }

    return { init };
  }

  function resetSetup(player) {
    player.gameboard.unplaceAllShips();
    view.renderBoard(player.getName(), player.gameboard.getBoardSize());

    for (let i = 0; i < CONFIG.NUM_SHIPS; i++) {
      view.removePlaceableShip(i);
      view.addPlaceableShip(i);
    }
  }

  function autoPlace(player) {
    const shipIDs = Array.from(
      { length: CONFIG.NUM_SHIPS },
      (_, shipID) => shipID,
    ).sort((a, b) => CONFIG.SHIP_LENGTHS[b] - CONFIG.SHIP_LENGTHS[a]);

    for (const shipID of shipIDs) {
      const length = CONFIG.SHIP_LENGTHS[shipID];
      const placement = getRandomValidPlacement(player, shipID, length);

      if (!placement) {
        throw new Error(`Could not auto-place ship ${shipID}.`);
      }

      const { coordsList, valid } = player.gameboard.placeShip(
        shipID,
        length,
        placement.coords,
        placement.isVertical,
      );

      if (!valid) {
        throw new Error(`Auto-placement failed for ship ${shipID}.`);
      }

      if (player === player1) {
        view.removePlaceableShip(shipID);
      }

      view.placeShip(
        player.getName(),
        coordsList,
        shipID,
        placement.isVertical,
      );
    }
  }

  function getRandomValidPlacement(player, shipID, length) {
    const placements = getValidPlacements(player, shipID, length);

    if (!placements.length) return null;

    const index = Math.floor(Math.random() * placements.length);
    return placements[index];
  }

  function getValidPlacements(player, shipID, length) {
    const size = player.gameboard.getBoardSize();
    const placements = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        for (const isVertical of [false, true]) {
          const { valid } = player.gameboard.getPreview(
            shipID,
            length,
            [y, x],
            isVertical,
          );

          if (valid) {
            placements.push({
              coords: [y, x],
              isVertical,
            });
          }
        }
      }
    }

    return placements;
  }

  // ====================
  // BATTLE PHASE
  // ====================

  function startBattlePhase() {
    sound.music.battle();

    view.setAmbientPhase("battle-phase");

    clearListeners();

    const battle = createBattleController();
    battle.init();
  }

  function createBattleController() {
    const { p1Board, p2Board } = view.eventElems;
    let waiting = false;

    function init() {
      addListener(p1Board, "click", onClick);
      addListener(p2Board, "click", onClick);

      addListener(p2Board, "mouseover", onHover);

      if (player1.getType() === "computer") {
        attack(player2.getName());
      }
    }

    async function attack(receiverName, coords = null) {
      waiting = true;

      const receiver = getPlayer(receiverName);

      const isComputer = receiver.getType() === "real";
      view.playFireSound(isComputer);

      await sleep(CONFIG.HIT_DELAY);

      const result = game.attack(receiverName, coords);

      view.hitCell(receiverName, result.coords);

      if (result.shipSunk) {
        view.revealShip(receiverName, result.shipID);
      }

      const { winner } = game.getState();
      if (winner) return;

      if (receiver.getType() === "computer") {
        await sleep(CONFIG.COMPUTER_DELAY);
        const next = otherPlayer(receiverName);
        await attack(next.getName());
      }

      waiting = false;
    }

    function onClick(e) {
      if (waiting) return;
      if (!e.target.classList.contains("cell")) return;
      if (e.target.classList.contains("hit")) return;

      const coords = view.parseCellCoords(e.target);
      const receiver = this.dataset.playername;

      attack(receiver, coords);
    }

    function onHover(e) {
      if (!e.target.classList.contains("cell")) return;
      if (e.target.classList.contains("hit")) return;

      view.playCellHoverSound("target");
    }

    // Autoplay (dev)
    // function autoplay() {
    //   let y = 0;
    //   let x = 0;
    //   setInterval(() => {
    //     p2Board.querySelector(`.cell[data-coords="${y},${x}"]`).click();
    //     y++;
    //     if (y === 10) {
    //       y = 0;
    //       x++;
    //     }
    //   }, CONFIG.AUTOPLAY_DELAY);
    // }

    // autoplay;
    // autoplay(); // dev

    return { init };
  }

  // ====================
  // HELPERS
  // ====================

  function getPlayer(name) {
    return player1.getName() === name ? player1 : player2;
  }

  function otherPlayer(name) {
    return player1.getName() === name ? player2 : player1;
  }

  function bindButtonHover(btn) {
    addListener(btn, "mouseenter", view.playButtonHoverSound);
    addListener(btn, "mouseleave", view.clearHoverSoundTimeout);
  }

  function addListener(el, event, handler) {
    el.addEventListener(event, handler);
    cleanupFns.push(() => el.removeEventListener(event, handler));
  }

  function clearListeners() {
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];
  }

  return { init };
}
