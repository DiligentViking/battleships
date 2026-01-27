import { Player } from "./player";
import { View } from "./view";
import { Controller } from "./controller";

const player1 = Player();
const player2 = Player();

const view = View(document.querySelector('.game-area'));

const controller = Controller(player1, player2, view);

controller.init();
