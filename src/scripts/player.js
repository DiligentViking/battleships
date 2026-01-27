import { Gameboard } from "./gameboard"

export function Player(type) {
  return {
    type,
    gameboard: Gameboard(),
  }
}
