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

    getBoardSize: () => BOARD_SIZE,

    getCellExists: (coords) => {
      const [y, x] = coords;
      return board[y]?.[x] ? true : false;
    },

    getCellHit: (coords) => {
      const [y, x] = coords;
      return board[y][x].hit;
    },

    getCellHasShip: (coords) => {
      const [y, x] = coords;
      return board[y][x].shipID !== null ? true : false;
    },

    getCellShipIsSunk: (coords) => {
      const [y, x] = coords;
      const shipID = board[y][x].shipID;
      const ship = ships[shipID];
      return ship.isSunk();
    },

    areAllShipsSunk: () => numSunk === ships.length,

    placeShip: (shipID, shipLength, coords) => {
      const [y, x] = coords;
      const coordsList = [];

      for (let i = 0; i < shipLength; i++) {
        const cellToCheck = board[y][x + i];
        if (cellToCheck?.shipID !== null) {
          return 1;
        }
      }

      for (let i = 0; i < shipLength; i++) {
        const surroundingCells = [
          board[y - 1]?.[x + i],
          board[y - 1]?.[x + i + 1],
          board[y]?.[x + i + 1],
          board[y + 1]?.[x + i + 1],
          board[y + 1]?.[x + i],
          board[y + 1]?.[x + i - 1],
          board[y]?.[x + i - 1],
          board[y - 1]?.[x + i - 1],
        ];
        for (const cell of surroundingCells) {
          if (
            cell?.shipID !== null &&
            cell?.shipID !== undefined &&
            cell?.shipID !== shipID
          ) {
            return 1;
          }
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
