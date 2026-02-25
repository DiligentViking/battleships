import { Gameboard } from "./gameboard.js";

export function Player(name, type) {
  const gameboard = Gameboard();

  function chooseRandomCoords(board) {
    const choices = [];
    for (let i = 0; i < board.getBoardHeight(); i++) {
      for (let j = 0; j < board.getBoardWidth(); j++) {
        if (!board.getCellHit([i, j])) {
          choices.push([i, j]);
        }
      }
    }
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  }

  return {
    gameboard,

    getName: () => name,

    getType: () => type,

    attack: (enemyGameboard, coords) => {
      if (type === "computer") {
        coords = chooseRandomCoords(enemyGameboard);
      }
      enemyGameboard.receiveAttack(coords);
      return coords;
    },
  };
}
