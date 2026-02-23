import { Ship } from "../ship";

test("increases hits", () => {
  const ship = Ship(3);
  ship.hit();
  ship.hit();
  expect(ship._getDebugInfo().hits).toBe(2);
});

test("is sunk if hits equals length", () => {
  const ship = Ship(3);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});
