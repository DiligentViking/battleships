import { Ship } from "./ship.js";
import { deepCopy } from "./utils.js";

export function Gameboard() {
  const ships = [];
  let numSunk = 0;

  const board = [];
  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
      row.push({ shipID: null, hit: false });
    }
    board.push(row);
  }

  return {
    getShips() {
      return deepCopy(ships);
    },

    getNumSunk() {
      return numSunk;
    },

    getBoard() {
      return deepCopy(board);
    },

    getBoardHeight() {
      return board.length;
    },

    getBoardWidth() {
      return board[0].length;
    },

    getCellHit(coords) {
      const [y, x] = coords;
      return board[y][x].hit;
    },

    placeShip(shipID, shipLength, coords) {
      const [y, x] = coords;
      for (let i = 0; i < shipLength; i++) {
        if (board[y][x + i]?.shipID !== null) {
          throw new Error("Cell out of bounds or already taken");
        }
      }
      for (let i = 0; i < shipLength; i++) {
        board[y][x + i].shipID = shipID;
      }
      ships.push(Ship(shipLength));
    },

    receiveAttack(coords) {
      const [y, x] = coords;
      const shipID = board[y][x].shipID;
      if (shipID !== null) {
        ships[shipID].hit();
        if (ships[shipID].isSunk()) numSunk++;
      }
      board[y][x].hit = true;
    },

    areAllShipsSunk() {
      return numSunk === ships.length;
    },
  };
}
