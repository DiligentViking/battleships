import { Ship } from "./ship.js";
import { deepCopy } from "./utils.js";

export function Gameboard() {
  const BOARD_SIZE = 10;

  const ships = [];
  let numSunk = 0;

  const board = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push({ shipID: null, hit: false });
    }
    board.push(row);
  }

  return {
    _getDebugInfo: () => ({
      ships: deepCopy(ships),
      numSunk,
      board: deepCopy(board),
    }),

    getBoardHeight: () => board.length,

    getBoardWidth: () => board[0].length,

    getCell: (coords) => {
      const [y, x] = coords;
      return { ...board[y][x] };
    },

    getCellHit: (coords) => {
      const [y, x] = coords;
      return board[y][x].hit;
    },

    areAllShipsSunk: () => numSunk === ships.length,

    placeShip: (shipID, shipLength, coords) => {
      const [y, x] = coords;
      const coordsList = [];

      for (let i = 0; i < shipLength; i++) {
        if (board[y][x + i]?.shipID !== null) {
          throw new Error("Cell out of bounds or already taken");
        }
      }
      for (let i = 0; i < shipLength; i++) {
        board[y][x + i].shipID = shipID;
        coordsList.push([y, x + i]);
      }

      ships.push(Ship(shipLength));

      return coordsList;
    },

    getPreview: (shipLength, coords) => {
      const [y, x] = coords;
      const coordsList = [];
      let valid = true;

      for (let i = 0; i < shipLength; i++) {
        if (board[y][x + i]?.shipID !== null) {
          valid = false;
        }
        coordsList.push([y, x + i]);
      }

      return { coordsList, valid };
    },

    unplaceAllShips: () => {
      ships.length = 0;

      for (const row of board) {
        for (const cell of row) {
          cell.shipID = null;
        }
      }
    },

    receiveAttack: (coords) => {
      const [y, x] = coords;
      const cell = board[y][x];
      const shipID = cell.shipID;

      if (cell.hit) throw new Error("Cell already hit");

      if (shipID !== null) {
        ships[shipID].hit();
        if (ships[shipID].isSunk()) numSunk++;
      }
      cell.hit = true;
    },
  };
}
