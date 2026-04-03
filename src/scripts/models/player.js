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
        if (smartness === 0) {
          const coords = chooseRandomItem(remainingCells);
          enemyGameboard.receiveAttack(coords);
          return coords;
        } else if (smartness === 1) {
          // PSUEDO-CODE:
          // attack a random cellA
          // if cellA has a ship, proceed; if not, repeat above step
          // pop one of the four cardinal directions and attack cellB
          // if cellB has a ship, proceed; if not, repeat above step
          // continue attacking cells in the direction you found, until you hit a wall or empty cell
          // go backwards attacking cells in the direction you found
          // if after any attack the ship is sunk, stop and restart algorithm

          if (smartLogic.startCell) {
            let direction, coords, valid;
            do {
              // Pop a direction
              [direction, coords] = chooseRandomItem(
                Object.entries(smartLogic.adjacentCells).filter(
                  (item) => item[1] !== null,
                ),
              );
              smartLogic.adjacentCells[direction] = null;

              // Check if valid target
              valid =
                enemyGameboard.getCellExists(coords) &&
                !enemyGameboard.getCellHit(coords);
            } while (!valid);

            enemyGameboard.receiveAttack(coords);

            if (enemyGameboard.getCellHasShip(coords)) {
              if (!enemyGameboard.getCellShipIsSunk(coords)) {
                smartLogic.prevCell = coords;
                smartLogic.direction = direction;
              } else {
                smartLogic.startCell = null;
                smartLogic.prevCell = null;
              }
            }

            return coords;
          } else {
            const coords = chooseRandomItem(remainingCells);

            enemyGameboard.receiveAttack(coords);

            if (enemyGameboard.getCellHasShip(coords)) {
              if (!enemyGameboard.getCellShipIsSunk(coords)) {
                const [y, x] = coords;
                smartLogic.startCell = coords;
                smartLogic.adjacentCells.top = [y - 1, x];
                smartLogic.adjacentCells.right = [y, x + 1];
                smartLogic.adjacentCells.bottom = [y + 1, x];
                smartLogic.adjacentCells.left = [y, x - 1];
              } else {
                smartLogic.startCell = null;
                smartLogic.prevCell = null;
              }
            }

            return coords;
          }
        }
      } else {
        enemyGameboard.receiveAttack(coords);
        return coords;
      }
    },
  };
}
