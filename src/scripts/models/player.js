import { Gameboard } from "./gameboard.js";

export function Player(name, type) {
  const gameboard = Gameboard();

  const targets = [];

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
        const randomTarget = Math.floor(Math.random() * targets.length);
        coords = targets.splice(randomTarget, 1)[0];
      }
      enemyGameboard.receiveAttack(coords);
      return coords;
    },
  };
}
