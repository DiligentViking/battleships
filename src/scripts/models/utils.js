export function deepCopy(dataStruct) {  // Note that this only works on plain objects on arrays, nothing like maps or sets or classes even
  const copy = dataStruct instanceof Array ? [] : {};
  for (const [key, value] of Object.entries(dataStruct)) {
    if (value instanceof Object) {
      copy[key] = deepCopy(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}
