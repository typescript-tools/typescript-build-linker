import * as path from 'path'
import { docopt } from 'docopt'
import zip from '@strong-roots-capital/zip'
import memoize from 'fast-memoize'

import {
    id,
    map,
    prop,
    trace,
    traceDebugger
} from './functional-programming'

import {
    File,
    readJson,
    packageNames,
    packageJsons,
    packageDirectories,
    internalPackageDependencies,
    internalPackagePath,
    toPackageReferences,
    writePackageReferences,
    directoriesContainingPackages,
    writeParentTsconfig
} from './typescript-build-linker'

import {
    negate,
    JSONstringifyPretty
} from './utils'


/* eslint-disable @typescript-eslint/no-var-requires */
const compose = require('just-compose')
const Either = require('data.either')
/* eslint-enable @typescript-eslint/no-var-requires */

const debug = traceDebugger(require('debug')('tsl'))

// TODO: create an npm bin entrypoint
// TODO: don't print anything on a successful run
// TODO: probably add a [--dry-run] option
const docstring = (): string => `
Usage:
      tsl [--dry-run] <repository>
`

interface CommandLineOptions {
    [key: string]: string;
}

const asEither = (errorMessage: string) => (value: any) =>
    value ? Either.Right(value) : Either.Left(errorMessage)

// parseOptions :: CommandLineOptions
const parseOptions = memoize((): CommandLineOptions =>
    docopt(docstring(), {
        help: true,
        version: null,
        exit: true
    }))

// isDryRun :: Boolean
const isDryRun = (): boolean =>
    compose(
        parseOptions,
        prop('--dry-run'),
        // negate,
        // asEither('Use enabled `--dry-run` option')
    )()


const repositoryRoot = (): string =>
    compose(
        parseOptions,
        prop('<repository>')
    )()

const absoluteRepositoryRoot = compose(
    repositoryRoot,
    path.resolve
)

const repositoryFile = (filename: string): string =>
    path.join(repositoryRoot(), filename)

const lernaJson = () =>
    repositoryFile('lerna.json')


// lernaPackagesGlob :: File -> string[]
const lernaPackagesGlob = memoize(compose(
    lernaJson,
    readJson,
    prop('packages'),
    map(repositoryFile),
    debug('lerna packages glob')
))

// lernaPackageNames :: File -> string[]
// const lernaPackageNames = compose(
//     lernaPackagesGlob,
//     packageNames,
//     debug('lernaPackagenames')
// )

const zipWithPackageDirectory = compose(
    lernaPackagesGlob,
    packageJsons,
    map(path.dirname),
    zip
)()

const lernaPackageDependencies = compose(
    lernaPackagesGlob,
    internalPackageDependencies,
    map(map(internalPackagePath(lernaPackagesGlob()))),
    zipWithPackageDirectory,
)


const pathInRepository = (file: File): File =>
    path.relative(absoluteRepositoryRoot(), file)

const lernaPackages = memoize(compose(
    lernaPackagesGlob,
    packageDirectories,
    map(pathInRepository),
    debug('lerna packages')
))



// linkDependentPackages :: Effect
const linkDependentPackages = (dryRun: boolean) => compose(
    lernaPackageDependencies,
    // map(writeReferences),
    map(toPackageReferences),
    debug('lerna package references'),
    // FIXME: abstract this writing into a more reusable form
    map(writePackageReferences(dryRun)),

    JSONstringifyPretty,
    console.log.bind(null)
)

// linkChildrenPackages :: Effect
const linkChildrenPackages = compose(
    lernaPackages,
    directoriesContainingPackages,
    map(writeParentTsconfig(repositoryRoot(), lernaPackages())),
    JSONstringifyPretty,
    console.log.bind(null)
)


// FIXME: wire-up dryRun flag
const main = (dryRun: boolean) => {
    linkDependentPackages(dryRun)()
    // linkChildrenPackages()
}

compose(
    isDryRun,
    debug('isDryRun'),
    main
)()
