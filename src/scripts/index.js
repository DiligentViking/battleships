import { Player } from "./player.js";
import { View } from "./view.js";
import { Controller } from "./controller.js";

const player1 = Player("real");
const player2 = Player("computer");

const view = View(document.querySelector(".game-area"));

const controller = Controller(player1, player2, view);

// Dev
(() => {
  player1.gameboard.addShip(2);
  player1.gameboard.addShip(3);
  player1.gameboard.addShip(4);
  player1.gameboard.placeShip(1, [2, 2]);
  player1.gameboard.placeShip(2, [3, 4]);
  player1.gameboard.placeShip(3, [7, 3]);

  player2.gameboard.addShip(2);
  player2.gameboard.addShip(3);
  player2.gameboard.addShip(4);
  player2.gameboard.placeShip(1, [7, 2]);
  player2.gameboard.placeShip(2, [6, 4]);
  player2.gameboard.placeShip(3, [2, 3]);
})();

controller.init();
