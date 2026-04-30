export function deepCopy(dataStruct) {
  // Note that this only works on plain objects and arrays.
  const copy = dataStruct instanceof Array ? [] : {};

  for (const [key, value] of Object.entries(dataStruct)) {
    if (value instanceof Function) {
      copy[key] = value;
    } else if (value instanceof Object) {
      copy[key] = deepCopy(value);
    } else {
      copy[key] = value;
    }
  }

  return copy;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function once(el, event, cb) {
  const handler = (e) => {
    el.removeEventListener(event, handler);
    cb(e);
  };

  el.addEventListener(event, handler);
}