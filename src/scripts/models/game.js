export function Game(player1, player2) {
  let turn = 1;

  return {
    attack(coords) {
      const attacker = turn === 1 ? player1 : player2;
      const receiver = turn === 1 ? player2 : player1;
      
      attacker.attack(receiver.gameboard, coords);
      turn = turn === 1 ? 2 : 1;
    },

    getState() {
      const wasAttacker = turn === 1 ? player2 : player1;
      const wasReceiver = turn === 1 ? player1 : player2;

      const winner = wasReceiver.gameboard.areAllShipsSunk() ? wasAttacker.getName() : null;

      return { turn, winner };
    },
  };
}
