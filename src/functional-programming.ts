/**
 * Functional-programming utilities
 */

// prop :: string -> any
export const prop = (property: string) => (obj: any) =>
    obj[property]

// safeProp :: string -> any (truthy)
export const safeProp = (property: string) => (obj: any) =>
    obj[property] || {}

// asProp :: string -> any -> { string: any }
export const asProp = (property: string) => (value: any) =>
    ({
        [property]: value
    })

// id :: any -> any
export const id = (x: any) =>
    x

// map :: (any -> any) -> any -> any
export const map = (f: (box: any) => any) => (box: any) =>
    box.map(f)

// filter :: (any -> boolean) -> any -> any[]
export const filter = (predicate: (box: any) => boolean) => (box: any) =>
    box.filter(predicate)

export const objectMap = (f: (value: any, key: string) => any) => (obj: any) =>
    Object.keys(obj)
        .reduce(
            (accumulator, key) => Object.assign(
                accumulator,
                {[key]: f(obj[key], key)}
            ),
            {}
        )

// trace :: string -> any -> any
export const trace = (label: string) => (x: any) => {
    console.log(`${label}: ${JSON.stringify(x, null, 4)}`)
    return x
}

// traceDebugger :: (string -> any) -> string -> any -> any
export const traceDebugger = (debugStream: any) => (label: string) => (x: any) => {
    debugStream(`${label}: ${JSON.stringify(x, null, 4)}`)
    return x
}

export const log = (isDryRun: boolean) => (logger: any) => (...message: any[]) => {
    isDryRun ? (logger(...message), id) : id
}

/**
 * Shame on me
 *
 * Don't extend builtin prototypes #SmooshGate
 *
 * It would be better to use the bind operator syntax (::) but
 * TypeScript has opted not to support it until the official proposal
 * is farther along.
 */
declare global {
    interface Array<T> {
        scan<R = any>(callback: (aggregate: R, item: T) => R, initialValue: R): R[];
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
Array.prototype.scan = function<R = any>(callback: (aggregate: R, item: any) => R, initialValue: R) {
    const appendAggregate = (acc: R[], item: any) => {
        const aggregate = acc.slice(-1)[0] //get last item
        const newAggregate = callback(aggregate, item)
        return [...acc, newAggregate]
    }

    const accumulator = [initialValue]
    return this.reduce(appendAggregate, accumulator)
}

/**
 * Shame on me
 *
 * Don't extend builtin prototypes #SmooshGate
 *
 * It would be better to use the bind operator syntax (::) but
 * TypeScript has opted not to support it until the official proposal
 * is farther along.
 */

declare global {
    interface Array<T> {
        mash<R = any>(callback: (item: T) => [string, R]): {[key: string]: R};
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
Array.prototype.mash = function<R = any>(callback: (item: any) => [string, R]): {[key: string]: R} {
    const addKeyValuePair = (acc: {[key: string]: R}, item: any) => {
        const [key, value] = callback ? callback(item) : item
        return {...acc, [key]: value}
    }

    return this.reduce(addKeyValuePair, Object.create({}))
}
