import { Gameboard } from "./gameboard.js";

export function Player(name, type) {
  const gameboard = Gameboard();

  return {
    gameboard,

    getName() {
      return name;
    },

    getType() {
      return type;
    },
  };
}
