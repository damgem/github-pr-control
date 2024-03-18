export function reverseObject<KeyT extends PropertyKey, ValT extends PropertyKey>(obj: {[key in KeyT]: ValT}) {
    const revObj: Partial<{[key in ValT]: KeyT[]}> = {}

    for (let [key, value] of Object.entries(obj) as [KeyT, ValT][]) {
        if (revObj.hasOwnProperty(value)) {
            revObj[value]!.push(key)
        } else {
            revObj[value] = [key]
        }
    }

    return revObj
}

export function createObjectFromKeysAndValues<T>(keys: PropertyKey[], values: T[]) {
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}
