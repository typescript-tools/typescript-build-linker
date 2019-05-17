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
    packageDirectories,
    internalPackageDependencies,
    internalPackagePath,
    writeReferences,
    directoriesContainingPackages,
    writeParentTsconfig
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

const prettyJSONStringify = (obj: any): string =>
    JSON.stringify(obj, null, 4)

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

const absoluteRepositoryRoot = compose(
    repositoryRoot,
    path.resolve
)

const repositoryFile = (filename: string): string =>
    path.join(repositoryRoot(), filename)

const lernaJson = () =>
    repositoryFile('lerna.json')

// lernaPackagesGlob :: File -> string[]
const lernaPackagesGlob = compose(
    lernaJson,
    readJson,
    prop('packages'),
    // trace('lernaPackagesGlob')
)

// lernaRepositoryPackagesGlob :: File -> string[]
const lernaRepositoryPackagesGlob = compose(
    lernaPackagesGlob,
    map(repositoryFile),
    // trace('lernaPackagesGlob')
)

// lernaPackageNames :: File -> string[]
const lernaPackageNames = compose(
    lernaRepositoryPackagesGlob,
    packageNames,
    // trace('lernaPackagenames')
)

const zipWithPackageDirectory = compose(
    lernaRepositoryPackagesGlob,
    packageJsons,
    map(path.dirname),
    zip
)()

const lernaPackageReferences = compose(
    lernaRepositoryPackagesGlob,
    trace('lerna repository packages glob'),
    internalPackageDependencies,
    map(map(internalPackagePath(lernaRepositoryPackagesGlob()))),
    zipWithPackageDirectory
)

const linkDependentPackages = compose(
    lernaPackageReferences,
    // trace('lerna package references'),
    map(writeReferences),
    prettyJSONStringify,
    console.log.bind(null)
)

const pathInRepository = (file: File): File =>
    path.relative(absoluteRepositoryRoot(), file)

const packagesInRepository = compose(
    lernaRepositoryPackagesGlob,
    packageDirectories,
    map(pathInRepository),
    // trace('packages in repository')
)


const linkChildrenPackages = compose(
    packagesInRepository,
    directoriesContainingPackages,
    map(writeParentTsconfig(repositoryRoot(), packagesInRepository())),
    prettyJSONStringify,
    console.log.bind(null)
)


linkDependentPackages()
linkChildrenPackages()
