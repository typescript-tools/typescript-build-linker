/**
 * typescript-build-linker
 * Link together packages in a mono-repo
 */


import * as fs from 'fs'
import * as path from 'path'
import * as tsconfig from 'tsconfig'
import globby from 'globby'
import zip from '@strong-roots-capital/zip'

import {
    id,
    map,
    filter,
    prop,
    safeProp,
    trace
} from './functions'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const compose = require('just-compose')

export type File = string

type Glob = string

interface Reference {
    path: string;
}


// FIXME: is unsafe, wrap in an Either
// lernaPackages :: string -> Object
export const readJson = compose(
    id,
    fs.readFileSync,
    JSON.parse.bind(null)
)

// TODO: ensure this doesn't go too deep, e.g. into a package's node_modules/package.json
// packageNames :: string[] -> string[]
export const packageJsons = (globs: Glob[]): File[] =>
    globby.sync(globs)
        .filter(filename => !filename.includes('node_modules'))
        .filter(filename => filename.includes('package.json'))

// packageDirectories :: Glob[] -> File[]
export const packageDirectories = compose(
    packageJsons,
    map(path.dirname)
)



// packageNames :: Glob[] -> string[]
export const packageNames = compose(
    packageJsons,
    map(readJson),
    map(prop('name'))
)


// FIXME: needs to be able to handle undefined dependencies
// jsonDependencies :: File => string[]
const jsonDependencies = compose(
    readJson,
    safeProp('dependencies'),
    Object.keys.bind(null)
)

const isInternalDependency = (globs: Glob[]) => (dependency: string): boolean =>
    packageNames(globs).includes(dependency)

// packageDependencies :: string[] -> string[][]
export const packageDependencies = compose(
    packageJsons,
    map(jsonDependencies)
)

export const internalPackageDependencies = (globs: Glob[]): File[] =>
    packageDependencies(globs)
        .map(filter(isInternalDependency(globs)))

// :: Glob[] -> { [key: string]: File }
const internalPackages = (glob: Glob[]): { [key: string]: File } =>
    zip(
        packageNames(glob),
        packageJsons(glob).map(path.dirname)
    ).reduce((res: any, duple: [string, string]) => (res[duple[0]] = duple[1], res), {})



export const internalPackagePath = (glob: Glob[]) => (pkg: string) =>
    internalPackages(glob)[pkg]

const toReferences = ([pkg, references]: [File, File[]]): [File, Reference[]] =>
    [pkg, references.map(reference => ({
        path: path.relative(path.resolve(pkg), path.resolve(reference))
    }))]

const parseTsconfig = (contents: string) =>
    tsconfig.parse(contents, '')

const stringify = (b: Buffer) =>
    b.toString()

// FIXME: will not like when there is no existing tsconfig.json
const readTsconfig = compose(
    id,
    fs.readFileSync,
    stringify,
    parseTsconfig
)

const writeJson = (file: File, contents: any) =>
    fs.writeFileSync(file, JSON.stringify(contents, null, 4))

// :: [string, Reference[]]
const addReferencesToTsconfig = ([pkg, references]: [string, Reference[]]) => {
    writeJson(
        path.join(pkg, 'tsconfig.json'),
        Object.assign(
            readTsconfig(path.join(pkg, 'tsconfig.json')),
            {references: references}
        )
    )
    return [pkg, references]
}

// writeReferences :: [string, File[]] => ??
export const writeReferences = compose(
    toReferences,
    // trace('as References'),
    addReferencesToTsconfig
)



const flatten = <T = any>(array: T[][]): T[] =>
    array.flat()

const uniquify = <T = any>(array: T[]): T[] =>
    array.filter((element: T, position: number) => array.indexOf(element) === position)


// directoriesContainingPackages :: File[] -> File[]
export const directoriesContainingPackages = compose(
    map(
        (pkg: File) =>
            path.dirname(pkg)
                .split(path.sep)
                .reduce((directories: File[], dir: File) =>
                    directories.concat(
                        path.join(directories[directories.length-1], dir)
                    ), [''])
                .filter(dir => dir !== '')
    ),
    flatten,
    uniquify
)

const containedInDirectory = (dir: File) => (pkg: File): boolean =>
    pkg.startsWith(dir)

const split = (splitter: string) => (data: string): string[] =>
    data.split(splitter)

const isNotEmpty = (str: string): boolean =>
    str.length !== 0

const unsafeHead = <T = any>(array: T[]): T =>
    array[0]

const childrenDirectories = (dir: File) => (packages: File[]): File[] =>
    compose(
        filter(containedInDirectory(dir)),
        map(pkg => pkg.replace(dir + path.sep, '')),
        map(split(path.sep)),
        map(unsafeHead),
        flatten,
        filter(isNotEmpty)
    ) (packages)

interface ParentReference {
    files: string[];
    references: Reference[];
}

const toParentReferences = ([pkg, references]: [File, File[]]): [File, ParentReference] =>
    [pkg, {
        files: [],
        references: references
            .map(reference => ({
                path: reference
            }))}]

const writeParentReferences = (repositoryRoot: string) => ([dir, json]: [File, ParentReference]) => {
    writeJson(path.join(repositoryRoot, dir, 'tsconfig.json'), json)
    return [dir, json]
}

export const writeParentTsconfig = (repositoryRoot: string, packages: File[]) => (dir: File) =>
    compose(
        toParentReferences,
        writeParentReferences(repositoryRoot)
    )([dir, childrenDirectories(dir)(packages)])
