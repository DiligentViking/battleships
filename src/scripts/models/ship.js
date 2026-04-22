export function Ship(length, isVertical) {
  let hits = 0;

  return {
    _getDebugInfo: () => ({
      hits,
    }),

    getLength: () => length,

    isVertical: () => isVertical,

    isSunk: () => hits === length,

    hit: () => {
      hits++;
    },
  };
}
