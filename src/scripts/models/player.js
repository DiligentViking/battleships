import { Gameboard } from "./gameboard.js";

export function Player(name, type) {
  const gameboard = Gameboard();

  function chooseRandomCoords(board) {
    const coords = [
      Math.floor(Math.random() * board.getBoardHeight()),
      Math.floor(Math.random() * board.getBoardWidth()),
    ];
    if (board.getCellHit(coords)) {
      return chooseRandomCoords(board);
    } else {
      return coords;
    }
  }

  return {
    gameboard,

    getName() {
      return name;
    },

    getType() {
      return type;
    },

    attack(enemyGameboard, coords) {
      if (type === "computer") {
        coords = chooseRandomCoords(enemyGameboard);
      }
      enemyGameboard.receiveAttack(coords);
    },
  };
}
