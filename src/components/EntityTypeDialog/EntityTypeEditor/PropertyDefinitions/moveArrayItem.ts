export const moveArrayItem = <T extends unknown>(arr: T[], index: number, up: boolean = false): T[] => {
  if (index < 0 || index >= arr.length)
    return arr;

  const neighborIndex = up ? index - 1 : index + 1;

  if (neighborIndex < 0 || neighborIndex >= arr.length)
    return arr;

  const newArr = [...arr];
  [newArr[index], newArr[neighborIndex]] = [newArr[neighborIndex], newArr[index]];

  return newArr;
}