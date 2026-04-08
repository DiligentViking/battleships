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

  function checkValidPlacement(shipID, shipLength, coords, isVertical) {
    const [y, x] = coords;
    const coordsList = [];
    let valid = true;

    for (let i = 0; i < shipLength; i++) {
      const cellToCheck = isVertical ? board[y + i]?.[x] : board[y][x + i];
      if (cellToCheck?.shipID !== null) {
        valid = false;
      }
    }

    for (let i = 0; i < shipLength; i++) {
      const surroundingCells = isVertical
        ? [
            board[y + i - 1]?.[x],
            board[y + i - 1]?.[x + 1],
            board[y + i]?.[x + 1],
            board[y + i + 1]?.[x + 1],
            board[y + i + 1]?.[x],
            board[y + i + 1]?.[x - 1],
            board[y + i]?.[x - 1],
            board[y + i - 1]?.[x - 1],
          ]
        : [
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
          valid = false;
        }
      }
    }

    for (let i = 0; i < shipLength; i++) {
      const cellCoord = isVertical ? [y + i, x] : [y, x + i];
      if (isVertical) coordsList.unshift(cellCoord);
      else coordsList.push(cellCoord);
    }

    return { coordsList, valid };
  }

  return {
    _getDebugInfo: () => ({
      ships: deepCopy(ships),
      numSunk,
      board: deepCopy(board),
    }),

    _logBoard: () => {
      let output = "";
      for (const row of board) {
        output += "|";
        for (const cell of row) {
          output += cell.shipID ?? " ";
          output += "|";
        }
        output += "\n";
      }
      console.log(output);
    },

    getBoardSize: () => BOARD_SIZE,

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

    placeShip: (shipID, shipLength, coords, isVertical) => {
      const [y, x] = coords;

      const { coordsList, valid } = checkValidPlacement(
        shipID,
        shipLength,
        coords,
        isVertical,
      );

      if (!valid) return { coordsList, valid };

      for (let i = 0; i < shipLength; i++) {
        const cellToPlaceOn = isVertical ? board[y + i]?.[x] : board[y][x + i];
        cellToPlaceOn.shipID = shipID;
      }

      ships.push(Ship(shipLength));

      return { coordsList, valid };
    },

    getPreview: (shipID, shipLength, coords, isVertical) => {
      return checkValidPlacement(shipID, shipLength, coords, isVertical);
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
