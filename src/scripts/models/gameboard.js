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
    _getDebugInfo: () => ({
      ships: deepCopy(ships),
      numSunk,
    }),

    getBoard: () => deepCopy(board),

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
