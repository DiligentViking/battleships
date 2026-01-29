import { Gameboard } from "../gameboard";

test("adds a ship", () => {
  const gameboard = Gameboard();

  gameboard.placeShip(1, 3, [1, 5]);
  expect(gameboard.ships[1].length).toBe(3);
});

test("places a ship horizontally at a coordinate", () => {
  const gameboard = Gameboard();

  gameboard.placeShip(1, 3, [1, 5]);
  expect(gameboard.board[1][5]).not.toBe(0);
  expect(gameboard.board[1][6]).not.toBe(0);
  expect(gameboard.board[1][7]).not.toBe(0);
});
test("does not place ship out of bounds", () => {
  const gameboard = Gameboard();

  expect(gameboard.placeShip(1, 3, [1, 8])).toBe(-1);
});
test("does not place ship in already taken cells", () => {
  const gameboard = Gameboard();

  gameboard.placeShip(1, 3, [1, 4]);
  expect(gameboard.placeShip(2, 5, [1, 2])).toBe(-1);
});

test("increments ship hits when a ship cell is hit", () => {
  const gameboard = Gameboard();
  gameboard.placeShip(1, 3, [1, 2]);

  gameboard.receiveAttack([1, 3]);
  expect(gameboard.ships[1].hits).toBe(1);
});
test("marks ship cell when the cell is hit", () => {
  const gameboard = Gameboard();
  gameboard.placeShip(1, 3, [1, 2]);

  gameboard.receiveAttack([1, 3]);
  expect(gameboard.board[1][3]).toEqual({"hit": true, "shipID": 1});
});
test("marks empty cell when the cell is hit", () => {
  const gameboard = Gameboard();
  gameboard.placeShip(1, 3, [1, 2]);

  gameboard.receiveAttack([2, 3]);
  expect(gameboard.board[2][3]).toEqual({"hit": true, "shipID": 0});
});

test("knows if all ships are sunk", () => {
  const gameboard = Gameboard();
  gameboard.placeShip(1, 1, [1, 4]);
  gameboard.placeShip(2, 2, [2, 4]);

  gameboard.receiveAttack([1, 4]);
  gameboard.receiveAttack([2, 4]);
  expect(gameboard.areAllShipsSunk()).toBe(false);
  gameboard.receiveAttack([2, 5]);
  expect(gameboard.areAllShipsSunk()).toBe(true);
});
