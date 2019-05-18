/**
 * A collection of simple utilities that live up to their name.
 */


// JSONstringifyPretty :: any -> string
export const JSONstringifyPretty = (obj: any): string =>
    JSON.stringify(obj, null, 4)

// negate :: any -> boolean
export const negate = (value: any) =>
    value ? false : true

// stringify :: Buffer -> string
export const stringify = (b: Buffer) =>
    b.toString()
