import { Gameboard } from "./gameboard.js";

export function Player(name, type) {
  const gameboard = Gameboard();

  function chooseRandomCoords1(board) {
    const coords = [
      Math.floor(Math.random() * board.getBoardHeight()),
      Math.floor(Math.random() * board.getBoardWidth()),
    ];
    if (board.getCellHit(coords)) {
      return chooseRandomCoords(board); // TODO: Make it where it chooses from available cells instead
    } else {
      return coords;
    }
  }

  function chooseRandomCoords(board) {
    const choices = [];
    board.getBoard().forEach((row, i) =>
      row.forEach((cell, j) => {
        if (!cell.hit) choices.push([i, j]);
      }),
    );
    const randomIndex = Math.floor(Math.random() * choices.length);
    console.log(choices[randomIndex]);
  }

  return {
    gameboard,

    getName: () => name,

    getType: () => type,

    attack: (enemyGameboard, coords) => {
      if (type === "computer") {
        coords = chooseRandomCoords(enemyGameboard);
        coords = chooseRandomCoords1(enemyGameboard);
      }
      enemyGameboard.receiveAttack(coords);
      return coords;
    },
  };
}
