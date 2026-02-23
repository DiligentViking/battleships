export function Ship(length) {
  return {
    length,
    hits: 0,

    isSunk: () => this.hits === this.length,

    hit: () => {
      this.hits++;
    },
  };
}
