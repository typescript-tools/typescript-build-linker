/**
 * Functional-programming utilities
 */

export const prop = (property: string) => (obj: any) =>
    obj[property]

export const safeProp = (property: string) => (obj: any) =>
    obj[property] || {}

export const asProp = (property: string) => (value: any) =>
    ({
        [property]: value
    })

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

export const invoke = (f: Function) =>
    f()

export const map = (f: (box: any) => any) => (box: any) =>
    box.map(f)

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


// export const scan = <R = any>(callback: (...args: any[]) => R, initialValue: R) => <T = any>(array: T[]) => {
//     const appendAggregate = (acc: R[], item: T) => {
//         const aggregate = acc.slice(-1)[0] // get last item
//         const newAggregate = callback(aggregate, item)
//         return [...acc, newAggregate]
//     }
//     const accumulator = [initialValue]
//     return array.reduce(appendAggregate, accumulator)
// }

// TODO: pull into own package
declare global {
    interface Array<T> {
        scan<R = any>(callback: (aggregate: R, item: T) => R, initialValue: R): R[];
    }
}

// TODO: use the bind-operator instead
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

// TODO: pull into own package
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
