export function Game(player1, player2) {
  let turn = 1;

  return {
    attack(coords) {
      const enemyPlayer = turn === 1 ? player2 : player1;
      
      enemyPlayer.gameboard.receiveAttack(coords);
      turn = turn === 1 ? 2 : 1;
    },

    getState() {
      const attacker = turn === 1 ? player2 : player1;
      const receiver = turn === 1 ? player1 : player2;

      const winner = receiver.gameboard.areAllShipsSunk() ? attacker.getName() : null;

      return { turn, winner };
    },
  };
}
