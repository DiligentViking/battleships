import { Gameboard } from "./gameboard.js";

export function Player(type) {
  const gameboard = Gameboard();

  return {
    gameboard,

    getType() {
      return type;
    },
  };
}
