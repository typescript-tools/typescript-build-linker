/**
 * Functional-programming utilities
 */

export const prop = (property: string) => (obj: any) =>
    obj[property]

export const safeProp = (property: string) => (obj: any) =>
    obj[property] || {}

export const trace = (label: string) => (x: any) => {
    console.log(`${label}: ${JSON.stringify(x, null, 4)}`)
    return x
}

export const traceDebugger = (debugStream: any) => (label: string) => (x: any) => {
    debugStream(`${label}: ${JSON.stringify(x, null, 4)}`)
    return x
}

export const id = (x: any) =>
    x

export const map = (f: (box: any) => any) => (box: any) =>
    box.map(f)

export const filter = (predicate: (box: any) => boolean) => (box: any) =>
    box.filter(predicate)
