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
export const packageJsons = (globs: Glob[]): string[] =>
    globby.sync(globs)
        .filter(filename => !filename.includes('node_modules'))
        .filter(filename => filename.includes('package.json'))


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
    prop('dependencies'),
    Object.keys.bind(null)
)

const isInternalDependency = (globs: string[]) => (dependency: string): boolean =>
    packageNames(globs).includes(dependency)

// packageDependencies :: string[] -> string[][]
export const packageDependencies = compose(
    packageJsons,
    map(jsonDependencies)
)

export const internalPackageDependencies = (globs: string[]): File[] =>
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

const toReferences = ([pkg, references]: [string, File[]]): [string, Reference[]] =>
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
}

// writeReferences :: [string, File[]] => ??
export const writeReferences = compose(
    toReferences,
    trace('as References'),
    addReferencesToTsconfig
)
