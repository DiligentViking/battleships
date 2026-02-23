export function Ship(length) {
  let hits = 0;

  return {
    _getDebugInfo: () => ({
      hits,
    }),

    getLength: () => length,

    isSunk: () => hits === length,

    hit: () => {
      hits++;
    },
  };
}
