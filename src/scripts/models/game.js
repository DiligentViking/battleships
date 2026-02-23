export function Game(player1, player2) {
  let turn = 1;

  return {
    getState: () => {
      const wasAttacker = turn === 1 ? player2 : player1;
      const wasReceiver = turn === 1 ? player1 : player2;

      const winner = wasReceiver.gameboard.areAllShipsSunk()
        ? wasAttacker.getName()
        : null;

      return { turn, winner };
    },

    attack: (receiverName, coords) => {
      if (receiverName === player2.getName() && turn !== 1)
        throw new Error("Not p1's turn");
      if (receiverName === player1.getName() && turn !== 2)
        throw new Error("Not p2's turn");

      const attacker = turn === 1 ? player1 : player2;
      const receiver = turn === 1 ? player2 : player1;

      attacker.attack(receiver.gameboard, coords);

      turn = turn === 1 ? 2 : 1;
    },
  };
}
