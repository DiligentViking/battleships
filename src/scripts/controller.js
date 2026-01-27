export function Controller(player1, player2, view) {
  return {
    init() {
      const board1 = player1.gameboard.getBoard();
      const board2 = player2.gameboard.getBoard();
      view.renderBoard(board1, 1);
      view.renderBoard(board2, 2);
    },
  }
}