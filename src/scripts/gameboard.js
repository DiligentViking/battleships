import { Ship } from "./ship.js";

export function Gameboard() {
  function createBoard() {
    const grid = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push({ shipID: 0, hit: false });
      }
      grid.push(row);
    }
    return grid;
  }

  return {
    ships: [null],
    board: createBoard(),
    numSunk: 0,

    getBoard() {
      return this.board;
    },

    placeShip(shipID, shipLength, coords) {
      const [y, x] = coords;
      for (let i = 0; i < shipLength; i++) {
        if (this.board[y][x + i]?.shipID !== 0) {
          throw new Error("Cell out of bounds or already taken");
        }
      }
      for (let i = 0; i < shipLength; i++) {
        this.board[y][x + i].shipID = shipID;
      }
      this.ships.push(Ship(shipLength));
    },

    receiveAttack(coords) {
      const [y, x] = coords;
      const shipID = this.board[y][x].shipID;
      if (shipID !== 0) {
        this.ships[shipID].hit();
        if (this.ships[shipID].isSunk()) this.numSunk++;
      }
      this.board[y][x].hit = true;
    },

    areAllShipsSunk() {
      return this.numSunk === this.ships.length - 1;
    },
  };
}
