import * as path from 'path'
import { docopt } from 'docopt'

import {
    readJson,
    packageNames,
    packageJsons,
    internalPackageDependencies
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/promise-function-async, @typescript-eslint/explicit-function-return-type
const prop = (property: string) => (obj: any): any =>
    obj[property]

const repositoryRoot = compose(
    parseOptions,
    prop('<repository>')
)

const repositoryFile = (filename: string): string =>
    path.join(repositoryRoot(), filename)


// lernaPackagesGlob :: string -> string
const lernaPackagesGlob = compose(
    readJson,
    prop('packages'),
    (packages: string[]) => packages.map(repositoryFile)
)

// lernaPackageNames :: string -> string[]
const lernaPackageNames = compose(
    lernaPackagesGlob,
    packageNames
)


// RESUME: link internal dependencies together
compose(
    lernaPackagesGlob,
    internalPackageDependencies,
    console.log.bind(null)
)(repositoryFile('lerna.json'))
