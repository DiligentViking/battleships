export function Controller(player1, player2, view) {
  return {
    init() {
      let board1 = player1.gameboard.getBoard();
      let board2 = player2.gameboard.getBoard();
      view.renderBoard(board1, 1);
      view.renderBoard(board2, 2);

      let turn = 1;
      const {p1Board, p2Board} = view.eventElems;
      p1Board.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          const coords = e.target.dataset.coord.split(',');
          player1.gameboard.receiveAttack(coords);
          board1 = player1.gameboard.getBoard();
          view.renderBoard(board1, 1);
        }
      });
    },
  }
}