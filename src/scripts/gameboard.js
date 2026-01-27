import { Ship } from "./ship";

export function Gameboard() {
  function createBoard() {
    const grid = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push(0);
      }
      grid.push(row);
    }
    return grid;
  }

  return {
    ships: [null],
    board: createBoard(),
    numSunk: 0,

    addShip(shipLength) {
      this.ships.push(Ship(shipLength));
    },

    placeShip(shipID, coords) {
      const [y, x] = coords;
      const ship = this.ships[shipID];
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y][x + i] !== 0)
          throw new Error("Cell out of bounds or already taken");
        this.board[y][x + i] = shipID;
      }
    },

    receiveAttack(coords) {
      const [y, x] = coords;
      if (this.board[y][x] !== 0) {
        this.ships[this.board[y][x]].hit();
        if (this.ships[this.board[y][x]].isSunk()) this.numSunk++;
        this.board[y][x] = "x";
      } else {
        this.board[y][x] = "m";
      }
    },

    areAllShipsSunk() {
      return this.numSunk === this.ships.length - 1;
    },
  };
}
