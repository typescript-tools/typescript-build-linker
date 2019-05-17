/**
 * typescript-build-linker
 * Link together packages in a mono-repo
 */

/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/no-explicit-any */

import * as fs from 'fs'
import * as path from 'path'
import globby from 'globby'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const compose = require('just-compose')


interface Package {
    file: string;
    dependencies: { [key: string]: string };
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/promise-function-async, @typescript-eslint/explicit-function-return-type
const prop = (property: string) => (obj: any): any =>
    obj[property]


// FIXME: is unsafe, wrap in an Either
// lernaPackages :: string -> string[]
export const readJson = compose(
    fs.readFileSync,
    JSON.parse.bind(null)
)

// TODO: ensure this doesn't go too deep, e.g. into a package's node_modules/package.json
// packageNames :: string[] -> string[]
export const packageJsons = (globs: string[]): string[] =>
    globby.sync(globs)
        .filter(filename => !filename.includes('node_modules'))
        .filter(filename => filename.includes('package.json'))


// packageNames :: string[] -> string[]
export const packageNames = (globs: string[]): string[] =>
    packageJsons(globs)
        .map(packageJson => readJson(packageJson))
        .map(prop('name'))

const jsonDependencies = (packageJson: string): Package =>
    ({
        file: packageJson,
        dependencies: compose(
            readJson,
            prop('dependencies')
        )(packageJson)
    })

const filterObject = <T = any>(obj: T, predicate: (key: string) => boolean): T =>
    Object.keys(obj)
        .filter(key => predicate(key))
        .reduce((res: any, key: string) => (res[key] = (obj as any)[key], res), {})

const isInternalDependency = (globs: string[]) => (dependency: string): boolean =>
    packageNames(globs).includes(dependency)

const internalDependencies = (globs: string[]) => (pkg: Package) =>
    Object.assign(pkg, {
        dependencies: filterObject(pkg.dependencies || {}, isInternalDependency(globs))
    })


export const internalPackageDependencies = (globs: string[]): Package[] =>
    packageJsons(globs)
        .map(jsonDependencies)
        .map(internalDependencies(globs))
