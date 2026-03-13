import { Gameboard } from "./gameboard.js";

export function Player(name, type, smartness = 0) {
  const gameboard = Gameboard();

  const targets = [];
  const smartLogic = { hitCell1: null, hitCell2: null };

  return {
    gameboard,

    getName: () => name,

    getType: () => type,

    initComputerTargets: (enemyBoardSize) => {
      for (let i = 0; i < enemyBoardSize; i++) {
        for (let j = 0; j < enemyBoardSize; j++) {
          targets.push([i, j]);
        }
      }
    },

    attack: (enemyGameboard, coords) => {
      if (type === "computer") {
        if (smartness === 0) {
          const randomTarget = Math.floor(Math.random() * targets.length);
          coords = targets.splice(randomTarget, 1)[0];
        } else if (smartness === 1) {
          // PSUEDO-CODE:
          // attack a random cellA
          // if cellA has a ship, proceed; if not, repeat above step
          // pop one of the four cardinal directions and attack cellB
          // if cellB has a ship, proceed; if not, repeat above step
          // continue attacking cells in the direction you found, until you hit a wall or empty cell
          // go backwards attacking cells in the direction you found
          // if after any attack the ship is sunk, stop and restart algorithm

          if (smartLogic.hitCell1) {
            ;
          } else {
            const randomTarget = Math.floor(Math.random() * targets.length);
            coords = targets.splice(randomTarget, 1)[0];
          }
        }
      }

      enemyGameboard.receiveAttack(coords);

      return coords;
    },
  };
}
