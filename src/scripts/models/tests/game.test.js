import { Player } from "../player.js";
import { Game } from "../game.js";

test("returns current player turn", () => {
  const player1 = Player("real");
  const player2 = Player("computer");
  const game = Game(player1, player2);

  const state = game.attack(3, 3);
  expect(state.turn).toBe(2);
});

test("switches player turn after each attack", () => {
  const player1 = Player("real");
  const player2 = Player("computer");
  const game = Game(player1, player2);

  const state = game.attack(3, 3);
  const state2 = game.attack(3, 4);
  const state3 = game.attack(3, 5);
  expect(state.turn).toBe(2);
  expect(state2.turn).toBe(1);
  expect(state3.turn).toBe(2);
});
