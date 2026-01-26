export function Ship(length) {
  return {
    hits: 0,

    hit() {
      this.hits++;
    },

    isSunk() {
      return this.hits === length;
    },
  };
}
