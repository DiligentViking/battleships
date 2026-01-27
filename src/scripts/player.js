import { Gameboard } from "./gameboard.js"

export function Player(type) {
  return {
    type,
    gameboard: Gameboard(),
  }
}
