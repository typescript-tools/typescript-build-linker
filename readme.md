# typescript-build-linker [![Build status](https://travis-ci.org/typescript-tools/typescript-build-linker.svg?branch=master)](https://travis-ci.org/typescript-tools/typescript-build-linker) [![npm version](https://img.shields.io/npm/v/@typescript-tools/typescript-build-linker.svg)](https://npmjs.org/package/@typescript-tools/typescript-build-linker)

> Link together TypeScript packages in a mono-repo

Automatically manage TypeScript Project References in a lerna
monorepo.

## Install

```shell
npm install @typescript-tools/typescript-build-linker
```

## Use

``` shell
tsl [--dry-run] <repository>
```

Point `tsl` at the root directory of your monorepo and it will write
the `references` list in each `tsconfig.json` file of every leaf
package and parent directory.

**Note**: This project assumes a directory layout similar to the
example in [lern-a], and is probably not flexible enough at this time
to handle other monorepo structures.

## Integrate into your build-system

Simply configure `tsl` to run before `tsc`.

Example `package.json` in monorepo root:

``` json
{
    "name": "root",
    "private": true,
    "scripts": {
        "make": "npm run bootstrap && npm run link && npm run build",
        "bootstrap": "lerna bootstrap --hoist",
        "link": "tsl .",
        "build": "tsc -b --verbose packages"
    },
    "devDependencies": {
        "@typescript-tools/typescript-build-linker": "^1.0.3",
        "lerna": "^3.13.2"
    }
}
```

## Related

- [lerna](https://github.com/lerna/lerna)

## Acknowledgments

- [lern-a]

[lern-a]: https://github.com/RyanCavanaugh/learn-a
