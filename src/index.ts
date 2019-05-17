import * as path from 'path'
import { docopt } from 'docopt'
import zip from '@strong-roots-capital/zip'

import {
    id,
    map,
    prop,
    trace
} from './functions'

import {
    File,
    readJson,
    packageNames,
    packageJsons,
    internalPackageDependencies,
    internalPackagePath,
    writeReferences
} from './typescript-build-linker'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const compose = require('just-compose')


// TODO: probably add a [--dry-run] option
const docstring = `
Usage:
      tsl <repository>
`

interface CommandLineOptions {
    [key: string]: string;
}


const parseOptions = (): CommandLineOptions =>
    docopt(docstring, {
        help: true,
        version: null,
        exit: true
    })

const repositoryRoot = compose(
    parseOptions,
    prop('<repository>')
)

const repositoryFile = (filename: string): string =>
    path.join(repositoryRoot(), filename)

const lernaJson = () =>
    repositoryFile('lerna.json')


// lernaPackagesGlob :: File -> string
const lernaPackagesGlob = compose(
    lernaJson,
    readJson,
    prop('packages'),
    map(repositoryFile),
    // trace('lernaPackagesGlob')
)

// lernaPackageNames :: File -> string[]
const lernaPackageNames = compose(
    lernaPackagesGlob,
    packageNames,
    // trace('lernaPackagenames')
)

const zipWithPackageDirectory = compose(
    lernaPackagesGlob,
    packageJsons,
    map(path.dirname),
    zip
)()

const lernaPackageReferences = compose(
    lernaPackagesGlob,
    internalPackageDependencies,
    map(map(internalPackagePath(lernaPackagesGlob()))),
    zipWithPackageDirectory
)


// TODO: link from top-down
compose(
    lernaPackageReferences,
    // trace('lerna package references'),
    map(writeReferences),
    // console.log.bind(null)
)()
