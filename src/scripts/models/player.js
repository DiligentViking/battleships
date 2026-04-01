import { Gameboard } from "./gameboard.js";

export function Player(name, type, smartness = 0) {
  const gameboard = Gameboard();

  const remainingCells = [];
  const smartLogic = { cellA: null, cellB: null };

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
          coords = chooseRandomItem(remainingCells);
        } else if (smartness === 1) {
          // PSUEDO-CODE:
          // attack a random cellA
          // if cellA has a ship, proceed; if not, repeat above step
          // pop one of the four cardinal directions and attack cellB
          // if cellB has a ship, proceed; if not, repeat above step
          // continue attacking cells in the direction you found, until you hit a wall or empty cell
          // go backwards attacking cells in the direction you found
          // if after any attack the ship is sunk, stop and restart algorithm

          if (smartLogic.cellA) {
            const [y, x] = smartLogic.cellA;
            const adjacentCells = [
              [y + 1, x],
              [y, x + 1],
              [y - 1, x],
              [y, x - 1],
            ];

            coords = chooseRandomItem(adjacentCells);
            enemyGameboard.receiveAttack(coords);
          } else {
            coords = chooseRandomItem(remainingCells);
            enemyGameboard.receiveAttack(coords);

            if (smartness === 1) {
              // After attack
              if (enemyGameboard.getCellHasShip(coords)) {
                if (!enemyGameboard.getCellShipIsSunk(coords)) {
                  smartLogic.cellA = coords;
                } else {
                  console.log("ship sunk");
                  smartLogic.cellA = null;
                  smartLogic.cellB = null;
                }
              }
            }
          }
        }
      } else {
        enemyGameboard.receiveAttack(coords);
      }

      return coords;
    },
  };
}
