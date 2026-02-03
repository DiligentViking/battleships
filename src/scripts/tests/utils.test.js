import { deepCopy } from "../utils.js";

test("copies shallow arr", () => {
  expect(deepCopy([3, 1, 4])).toEqual([3, 1, 4]);
});
test("copies nested arr", () => {
  expect(deepCopy([3, [5, 2, 8], 1, 4])).toEqual([3, [5, 2, 8], 1, 4]);
});
test("copies an arr with mixed nesting and data types", () => {
  expect(deepCopy([42,"hello",true,null,undefined,123n,["nested",[1,2,{deep:"value"}],[{a:1},{b:2}]],BigInt(9007199254740991),{0:"zero",1:"one",length:2}])).toStrictEqual([42,"hello",true,null,undefined,123n,["nested",[1,2,{deep:"value"}],[{a:1},{b:2}]],BigInt(9007199254740991),{0:"zero",1:"one",length:2}]);
});
