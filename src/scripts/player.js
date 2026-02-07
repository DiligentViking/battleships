import { Gameboard } from "./gameboard.js";

export function Player(strategy) {
  const gameboard = Gameboard();
  strategy = strategy(gameboard);
  
  return {
    gameboard, //dev
    placeShips(numShips, renderUpdate) {
      strategy.placeShips(numShips, renderUpdate);
    },
    
    getMove() {
      return strategy.getMove();
    },
  };
}


//testing

import { ComputerStrategy } from "./computer-strategy.js";

const player = Player(ComputerStrategy);

player.placeShips(6, () => null);

console.log('here');
console.log(player.getMove());

