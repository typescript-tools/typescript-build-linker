#!/usr/bin/env node

import * as path from 'path'
import { docopt } from 'docopt'
import zip from '@strong-roots-capital/zip'
import memoize from 'fast-memoize'

import {
    map,
    prop,
    log,
    traceDebugger
} from './functional-programming'

import {
    readJson,
    packageJsons,
    packageDirectories,
    internalPackageDependencies,
    internalPackagePath,
    toPackageReferences,
    writePackageReferences,
    directoriesContainingPackages,
    writeParentReferences,
    toParentReferences
} from './typescript-build-linker'

import {
    join,
    JSONstringifyPretty
} from './utils'

import {
    File
} from './types'


/* eslint-disable @typescript-eslint/no-var-requires */
const compose = require('just-compose')
/* eslint-enable @typescript-eslint/no-var-requires */

const debug = traceDebugger(require('debug')('tsl'))

const docstring = (): string => `
Usage:
      tsl [--dry-run] <repository>
`

interface CommandLineOptions {
    [key: string]: string;
}

// parseOptions :: CommandLineOptions
const parseOptions = memoize((): CommandLineOptions =>
    docopt(docstring(), {
        help: true,
        version: null,
        exit: true}))

// FIXME: make the dryRun output more representative of what will be
// written to disk

// isDryRun :: Boolean
const isDryRun = // (): boolean =>
    memoize(
        compose(
            parseOptions,
            prop('--dry-run'),
            debug('is dry run')))

// repositoryRoot :: string
const repositoryRoot =
    compose(
        parseOptions,
        prop('<repository>'))

// absoluteRepositoryRoot :: string
const absoluteRepositoryRoot =
    compose(
        repositoryRoot,
        path.resolve)

// repositoryFile :: string -> string
const repositoryFile =
    join(repositoryRoot())

// lernaJson :: string
const lernaJson = () =>
    repositoryFile('lerna.json')


// lernaPackagesGlob :: File -> Glob[]
const lernaPackagesGlob =
    memoize(
        compose(
            lernaJson,
            readJson,
            prop('packages'),
            map(repositoryFile),
            debug('lerna packages glob')))

const zipWithPackageDirectory =
    compose(
        lernaPackagesGlob,
        packageJsons,
        map(path.dirname),
        zip
    )()

const lernaPackageDependencies =
    compose(
        lernaPackagesGlob,
        internalPackageDependencies,
        map(map(internalPackagePath(lernaPackagesGlob()))),
        zipWithPackageDirectory)

// pathInRepository :: File -> File
const pathInRepository = (file: File): File =>
    path.relative(absoluteRepositoryRoot(), file)

// lernaPackages :: string[]
const lernaPackages =
    memoize(
        compose(
            lernaPackagesGlob,
            packageDirectories,
            map(pathInRepository)))

// linkDependentPackages :: boolean -> Effect
const linkDependentPackages = (isDryRun: boolean) =>
    compose(
        lernaPackageDependencies,
        map(toPackageReferences),
        debug('lerna package references'),
        map(writePackageReferences(isDryRun)),
        JSONstringifyPretty,
        log(isDryRun)(console.log.bind(console))
    )

// linkChildrenPackages :: Effect
const linkChildrenPackages = (isDryRun: boolean) =>
    compose(
        lernaPackages,
        debug('lerna packages'),
        directoriesContainingPackages,
        debug('directories containing packages'),
        toParentReferences(lernaPackages()),
        debug('parent references'),
        writeParentReferences(isDryRun)(repositoryRoot()),
        JSONstringifyPretty,
        log(isDryRun)(console.log.bind(console))
    )


// main :: boolean -> Effect
const main = () => {
    linkDependentPackages(isDryRun())()
    linkChildrenPackages(isDryRun())()
}

main()
