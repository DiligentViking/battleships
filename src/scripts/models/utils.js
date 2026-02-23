export function deepCopy(dataStruct) {  // Note that this only works on plain objects on arrays (and function refs are copied [which is completely reasonable compared to the alternative]), nothing like maps or sets or classes even
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
