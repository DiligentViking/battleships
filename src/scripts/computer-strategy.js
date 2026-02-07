export function ComputerStrategy(gameboard) {
  const moves = [];
  for (let i = 0; i < gameboard.getBoardHeight(); i++) {
    // we assume it is same as opponent's length
    for (let j = 0; j < gameboard.getBoardWidth(); j++) {
      moves.push([i, j]);
    }
  }
  for (let i = moves.length - 1; i > 0; i--) {
    // Fisher-Yates shuffle
    const j = Math.floor(Math.random() * (i + 1));
    [moves[i], moves[j]] = [moves[j], moves[i]];
  }

  return {
    placeShips(numShips, renderUpdate) {
      let count = 0;

      while (count !== numShips) {
        const shipID = count;
        const shipLength = count + 1;
        const coords = [
          Math.floor(Math.random() * gameboard.getBoardHeight()),
          Math.floor(Math.random() * gameboard.getBoardWidth()),
        ];

        try {
          gameboard.placeShip(shipID, shipLength, coords);
        } catch {
          continue;
        }

        renderUpdate();

        count++;
      }
    },

    getMove() {
      return moves.pop();
    },
  };
}
