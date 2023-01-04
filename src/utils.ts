/**
 * Converts a 1-indexed key Object into an Array
 * e.g.:
 *  {"1": "foo", "2": "bar"} => ['foo', 'bar']
 */
export const objToArray = (obj: Object): Array<any> => {
  // console.log(obj)
  let index = 1;
  const arr = [];
  const getIth = (i: number, o: Object) => o[`${i}`];
  while (getIth(index, obj)) {
    arr.push(getIth(index, obj));
    index++;
  }
  // console.error(arr)
  return arr;
};

export const displayIndex = (i) => i + 1;
export const getTableWidth = (table: Array<Object>): number =>
  objToArray(table[0]).length;

export const formatTable = (table: Array<Object>): Array<Array<any>> => {
  return table.map(objToArray);
};
