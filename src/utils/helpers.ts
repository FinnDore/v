/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const cloneArray = <T extends unknown[]>(array: T): T =>
    array.map(item => {
        if (Array.isArray(item)) {
            return cloneArray(item);
        } else if (typeof item === 'object') {
            return { ...item };
        } else {
            return item;
        }
    }) as unknown as T;

export const updateArrayItem = <T extends unknown[]>(
    array: T,
    predicate: (item: T[number]) => boolean,
    updater: (item: T[number]) => T[number]
): T => {
    const index = array.findIndex(predicate);
    if (index === -1) {
        return array;
    }
    const newArray = cloneArray(array);
    newArray[index] = updater(newArray[index]);
    return newArray;
};
