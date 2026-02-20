export function Game(player1, player2) {
  let turn = 1;

  return {
    attack() {
      turn = turn === 1 ? 2 : 1;
    },

    getState() {
      return { turn };
    },
  };
}
