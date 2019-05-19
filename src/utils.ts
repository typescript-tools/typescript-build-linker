/**
 * A collection of simple utilities that live up to their name.
 */

import * as path from 'path'

import {
    File
} from './types'


// JSONstringifyPretty :: any -> string
export const JSONstringifyPretty = (obj: any): string =>
    JSON.stringify(obj, null, 4)

// negate :: any -> boolean
export const negate = (value: any) =>
    value ? false : true

// stringify :: Buffer -> string
export const stringify = (b: Buffer) =>
    b.toString()

// split :: string -> string[]
export const split = (splitter: string) => (data: string): string[] =>
    data.split(splitter)

// sort :: [a] -> [a]
export const sort = <T = any>(array: T[]): T[] =>
    array.sort()

// dirname :: string -> string
export const dirname = (file: File): File =>
    path.dirname(file)

// isNotEmpty :: string -> boolean
export const isNotEmpty = (str: string): boolean =>
    str.length !== 0

// unsafeHead :: [a] -> a
export const unsafeHead = <T = any>(array: T[]): T =>
    array[0]

// unsafeTail :: [a] -> a
export const unsafeTail = <T = any>(array: T[]): T =>
    array[array.length-1]

// join :: string -> string -> string
export const join = (prefix: string) => (suffix: string): string =>
    path.join(prefix, suffix)

// flatten :: [[a]] -> [a]
export const flatten = <T = any>(array: T[][]): T[] =>
    array.flat()

// uniquify :: [a] -> [a]
export const uniquify = <T = any>(array: T[]): T[] =>
    array.filter((element: T, position: number) => array.indexOf(element) === position)

// containedInDirectory :: File -> file -> boolean
export const containedInDirectory = (dir: File) => (pkg: File): boolean =>
    pkg.startsWith(dir)
