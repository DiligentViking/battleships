import { Gameboard } from "./gameboard.js";

export function Player(name, type, smartness = 0) {
  const gameboard = Gameboard();

  const remainingCells = [];
  const smartLogic = {
    startCell: null,
    prevCell: null,
    adjacentCells: {
      top: null,
      right: null,
      bottom: null,
      left: null,
    },
    direction: null,
  };

  function makeDumbAIMove(enemyGameboard) {
    const coords = chooseRandomItem(remainingCells);
    enemyGameboard.receiveAttack(coords);
    return coords;
  }

  function makeSmartAIMove(enemyGameboard) {
    // PSUEDO-CODE:
    // attack a random cellA
    // if cellA has a ship, proceed; if not, repeat above step
    // pop one of the four cardinal directions and attack cellB
    // if cellB has a ship, proceed; if not, repeat above step
    // continue attacking cells in the direction you found, until you hit a wall or empty/hit cell
    // go backwards attacking cells in the direction you found
    // if after any attack the ship is sunk, stop and restart algorithm

    if (smartLogic.direction) {
      const adjacentCells = getAdjacentCells(smartLogic.prevCell);
      const targetCoords = adjacentCells[smartLogic.direction];

      const targetIndex = findIndexOfRemainingCell(targetCoords);
      if (targetIndex === -1) {
        switchDirections();
        return makeSmartAIMove(enemyGameboard);
      }

      enemyGameboard.receiveAttack(targetCoords);
      remainingCells.splice(targetIndex, 1);

      if (enemyGameboard.getCellShipIsSunk(smartLogic.startCell)) {
        resetSmartLogicState();
      } else if (!enemyGameboard.getCellHasShip(targetCoords)) {
        switchDirections();
      } else {
        smartLogic.prevCell = targetCoords;
      }

      return targetCoords;
    } else if (smartLogic.startCell) {
      let direction, targetCoords, targetIndex;
      do {
        // Pop a direction (this whole section can probably be refactored)
        [direction, targetCoords] = chooseRandomItem(
          Object.entries(smartLogic.adjacentCells).filter(
            (item) => item[1] !== null,
          ),
        );
        smartLogic.adjacentCells[direction] = null;

        targetIndex = findIndexOfRemainingCell(targetCoords);
      } while (targetIndex === -1);

      enemyGameboard.receiveAttack(targetCoords);
      remainingCells.splice(targetIndex, 1);

      if (enemyGameboard.getCellHasShip(targetCoords)) {
        if (!enemyGameboard.getCellShipIsSunk(targetCoords)) {
          smartLogic.prevCell = targetCoords;
          smartLogic.direction = direction;
        } else {
          resetSmartLogicState();
        }
      }

      return targetCoords;
    } else {
      const targetCoords = chooseRandomItem(remainingCells);

      enemyGameboard.receiveAttack(targetCoords);

      if (enemyGameboard.getCellHasShip(targetCoords)) {
        if (!enemyGameboard.getCellShipIsSunk(targetCoords)) {
          smartLogic.startCell = targetCoords;
          smartLogic.adjacentCells = getAdjacentCells(targetCoords);
        }
      }

      return targetCoords;
    }
  }

  function resetSmartLogicState() {
    smartLogic.startCell = null;
    smartLogic.prevCell = null;
    smartLogic.direction = null;
  }

  function switchDirections() {
    smartLogic.prevCell = smartLogic.startCell;

    const oppositeDirections = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    };
    smartLogic.direction = oppositeDirections[smartLogic.direction];
  }

  function findIndexOfRemainingCell(coords) {
    return remainingCells.findIndex(
      (item) => item[0] === coords[0] && item[1] === coords[1],
    );
  }

  function getAdjacentCells(coords) {
    const [y, x] = coords;
    return {
      top: [y - 1, x],
      right: [y, x + 1],
      bottom: [y + 1, x],
      left: [y, x - 1],
    };
  }

  function chooseRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0];
  }

  return {
    gameboard,

    getName: () => name,

    getType: () => type,

    initComputerTargets: (enemyBoardSize) => {
      for (let i = 0; i < enemyBoardSize; i++) {
        for (let j = 0; j < enemyBoardSize; j++) {
          remainingCells.push([i, j]);
        }
      }
    },

    attack: (enemyGameboard, coords) => {
      if (type === "computer") {
        if (smartness === 0) return makeDumbAIMove(enemyGameboard);
        if (smartness === 1) return makeSmartAIMove(enemyGameboard);
      } else {
        enemyGameboard.receiveAttack(coords);
        return coords;
      }
    },
  };
}
