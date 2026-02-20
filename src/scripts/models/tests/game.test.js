import { Player } from "../player.js";
import { Game } from "../game.js";

test("returns current player turn", () => {
  const player1 = Player("real");
  const player2 = Player("computer");
  const game = Game(player1, player2);

  expect(game.getState().turn).toBe(1);
});

test("switches player turn after each attack", () => {
  const player1 = Player("real");
  const player2 = Player("computer");
  const game = Game(player1, player2);

  expect(game.getState().turn).toBe(1);
  game.attack([3, 3]);
  expect(game.getState().turn).toBe(2);
  game.attack([3, 4]);
  expect(game.getState().turn).toBe(1);
  game.attack([3, 5]);
  expect(game.getState().turn).toBe(2);
});

test("attacks enemy gameboard", () => {
  const player1 = Player("real");
  const player2 = Player("computer");
  const game = Game(player1, player2);

  const spy = jest.spyOn(player2.gameboard, "receiveAttack");

  game.attack([3, 3]);
  expect(spy).toHaveBeenCalledWith([3, 3]);
});
