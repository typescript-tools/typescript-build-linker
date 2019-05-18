/**
 * typescript-build-linker
 * Link together packages in a mono-repo
 */

const debug = {
    fs: require('debug')('fs')
}

import * as fs from 'fs'
import * as path from 'path'
import * as tsconfig from 'tsconfig'
import globby from 'globby'
import zip from '@strong-roots-capital/zip'
import memoize from 'fast-memoize'

import {
    id,
    map,
    filter,
    objectMap,
    prop,
    safeProp,
    asProp,
    trace,
    traceDebugger
} from './functional-programming'

import {
    File,
    Glob
} from './types'

import {
    stringify,
    split,
    join,
    dirname,
    isNotEmpty,
    unsafeHead,
    unsafeTail,
    flatten,
    uniquify,
    containedInDirectory
} from './utils'

/* eslint-disable @typescript-eslint/no-var-requires */
const compose = require('just-compose')
/* eslint-enable @typescript-eslint/no-var-requires */

interface Reference {
    path: string;
}

interface References {
    references: Reference[];
}

interface ParentReference extends References {
    files: File[];
}


// FIXME: is unsafe, wrap in an Either
// lernaPackages :: string -> Object
export const readJson = compose(
    id,  // DISCUSS: why is this `id` necessary?
    fs.readFileSync,
    JSON.parse.bind(null)
)

// packageNames :: Glob[] -> File[]
export const packageJsons =
    memoize(
        compose(
            globby.sync.bind(null),
            filter(filename => !filename.includes('node_modules')),
            filter(filename => filename.includes('package.json'))))

// packageDirectories :: Glob[] -> File[]
export const packageDirectories =
    compose(
        packageJsons,
        map(path.dirname))

// packageNames :: Glob[] -> string[]
export const packageNames =
    compose(
        packageJsons,
        map(readJson),
        map(prop('name')))

// jsonDependencies :: File => string[]
const jsonDependencies =
    compose(
        readJson,
        safeProp('dependencies'),
        Object.keys.bind(null))

const isInternalDependency = (globs: Glob[]) => (dependency: string): boolean =>
    packageNames(globs).includes(dependency)

// packageDependencies :: string[] -> string[][]
export const packageDependencies =
    compose(
        packageJsons,
        map(jsonDependencies))

export const internalPackageDependencies = (globs: Glob[]): File[] =>
    packageDependencies(globs)
        .map(filter(isInternalDependency(globs)))

// :: Glob[] -> { [key: string]: File }
const internalPackages = (glob: Glob[]): { [key: string]: File } =>
    zip(
        packageNames(glob),
        packageJsons(glob).map(path.dirname)
    ).reduce(
        (res: any, duple: [string, string]) =>
            (res[duple[0]] = duple[1], res), {})

// internalPackagePath :: Glob[] -> File -> File
export const internalPackagePath = (glob: Glob[]) => (pkg: File) =>
    internalPackages(glob)[pkg]

// FIXME: can convert to a mash
export const toPackageReferences = ([pkg, references]: [File, File[]]): [File, References] =>
    [pkg, {
        references: references
            .map(reference => ({
                path: path.relative(path.resolve(pkg), path.resolve(reference))
            }))
    }]

// FIXME: will not like when there is no existing tsconfig.json
const tsconfigParse =
    compose(
        id,  // DISCUSS: is this necessary?
        fs.readFileSync,
        stringify,
        (contents: string) => tsconfig.parse(contents, ''))

const writeJson = (file: File, contents: any) => {
    debug.fs(`writing ${file} with contents: ${JSON.stringify(contents, null, 4)}`,)
    fs.writeFileSync(file, JSON.stringify(contents, null, 4))
}

// TODO: write more re-usably
// FIXME: write more functionally
// addReferencesToTsconfig :: [File, References -> [File, References
const addReferencesToTsconfig = ([pkg, references]: [File, Reference[]]) => {
    writeJson(
        path.join(pkg, 'tsconfig.json'),
        Object.assign(
            tsconfigParse(path.join(pkg, 'tsconfig.json')),
            references
        )
    )
    return [pkg, references]
}

// writeReferences :: boolean -> [File, Reference[]] => [File, Reference[]]
export const writePackageReferences = (dryRun: boolean) =>
    compose(
        dryRun ? id : addReferencesToTsconfig)




// directoriesContainingPackages :: File[] -> File[]
export const directoriesContainingPackages =
    compose(
        map(
            (pkg: File) =>
                path.dirname(pkg)
                    .split(path.sep)
                    .scan((acc: File, dir: File) => path.join(acc, dir), '')
                    .filter(isNotEmpty)
        ),
        flatten,
        uniquify)

// childrenDirectories :: File -> File[] -> File[]]
const childrenDirectories = (dir: File) =>
    compose(
        filter(containedInDirectory(dir)),
        map(pkg => pkg.replace(dir + path.sep, '')),
        map(split(path.sep)),
        map(unsafeHead),
        flatten,
        filter(isNotEmpty))

const asParentReferences = (packages: File[]) =>
    ({
        files: [],
        references: packages.map(asProp('path'))
    })

export const toParentReferences = (packages: File[]) => (parents: File[]) =>
    parents.mash((parent: File) => [
        parent,
        asParentReferences(childrenDirectories(parent)(packages))
    ])

export const writeParentReferences = (dryRun: boolean) => (repositoryRoot: File) =>
    compose(
        dryRun
            ? id
            : objectMap(
                (json: ParentReference, dir: File) => {
                    writeJson(path.join(repositoryRoot, dir, 'tsconfig.json'), json)
                    return json
                }))
