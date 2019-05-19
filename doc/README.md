
typescript-build-linker [![Build status](https://travis-ci.org/typescript-tools/typescript-build-linker.svg?branch=master)](https://travis-ci.org/typescript-tools/typescript-build-linker) [![npm version](https://img.shields.io/npm/v/@typescript-tools/typescript-build-linker.svg)](https://npmjs.org/package/@typescript-tools/typescript-build-linker)
=============================================================================================================================================================================================================================================================================================================================================================

> Link together TypeScript packages in a mono-repo

Automatically manages TypeScript Project References in a lerna monorepo.

Install
-------

```shell
npm install @typescript-tools/typescript-build-linker
```

Use
---

```shell
tsl [--dry-run] <repository>
```

Point `tsl` at the root directory of your monorepo and it will write the `references` list in each `tsconfig.json` file of every leaf package and parent directory.

This project assumes a directory layout similar to the example in [lern-a](https://github.com/RyanCavanaugh/learn-a), and is probably not flexible enough at this time to handle other monorepo structures.

Related
-------

*   [lerna](https://github.com/lerna/lerna)

Acknowledgments
---------------

*   [lern-a](https://github.com/RyanCavanaugh/learn-a)

## Index

### Variables

* [directoriesContainingPackages](#directoriescontainingpackages)
* [packageDependencies](#packagedependencies)
* [packageDirectories](#packagedirectories)
* [packageJsons](#packagejsons)
* [readJson](#readjson)

### Functions

* [internalPackageDependencies](#internalpackagedependencies)
* [internalPackagePath](#internalpackagepath)
* [toPackageReferences](#topackagereferences)
* [toParentReferences](#toparentreferences)
* [writePackageReferences](#writepackagereferences)
* [writeParentReferences](#writeparentreferences)

---

## Variables

<a id="directoriescontainingpackages"></a>

### `<Const>` directoriesContainingPackages

**● directoriesContainingPackages**: *`any`* = 
    compose(
        map(
            (pkg: File) =>
                path.dirname(pkg)
                    .split(path.sep)
                    .scan((acc: File, dir: File) => path.join(acc, dir), '')
                    .filter(isNotEmpty)
        ),
        flatten,
        uniquify,
        traceDebug('directories containing packages'))

*Defined in [typescript-build-linker.ts:184](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L184)*

___
<a id="packagedependencies"></a>

### `<Const>` packageDependencies

**● packageDependencies**: *`any`* = 
    compose(
        packageJsons,
        map((json: File) => [...jsonDependencies(json), ...jsonDevDependencies(json)]))

*Defined in [typescript-build-linker.ts:112](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L112)*

___
<a id="packagedirectories"></a>

### `<Const>` packageDirectories

**● packageDirectories**: *`any`* = 
    compose(
        packageJsons,
        map(path.dirname))

*Defined in [typescript-build-linker.ts:81](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L81)*

___
<a id="packagejsons"></a>

### `<Const>` packageJsons

**● packageJsons**: *`any`* = 
    memoize(
        compose(
            globbySync,
            filter(filename => !filename.includes('node_modules')),
            filter(filename => filename.includes('package.json'))))

*Defined in [typescript-build-linker.ts:73](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L73)*

___
<a id="readjson"></a>

### `<Const>` readJson

**● readJson**: *`any`* = 
    memoize(
        compose(
            id,  // DISCUSS: why is this `id` necessary?
            fs.readFileSync,
            JSON.parse.bind(null)))

*Defined in [typescript-build-linker.ts:61](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L61)*

___

## Functions

<a id="internalpackagedependencies"></a>

### `<Const>` internalPackageDependencies

▸ **internalPackageDependencies**(globs: *`Glob`[]*): `File`[]

*Defined in [typescript-build-linker.ts:118](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L118)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| globs | `Glob`[] |

**Returns:** `File`[]

___
<a id="internalpackagepath"></a>

### `<Const>` internalPackagePath

▸ **internalPackagePath**(glob: *`Glob`[]*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:132](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L132)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| glob | `Glob`[] |

**Returns:** `(Anonymous function)`

___
<a id="topackagereferences"></a>

### `<Const>` toPackageReferences

▸ **toPackageReferences**(__namedParameters: *[`string`, `Array`]*): (`string` \| `object`)[]

*Defined in [typescript-build-linker.ts:139](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L139)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| __namedParameters | [`string`, `Array`] |

**Returns:** (`string` \| `object`)[]

___
<a id="toparentreferences"></a>

### `<Const>` toParentReferences

▸ **toParentReferences**(packages: *`File`[]*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:215](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L215)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| packages | `File`[] |

**Returns:** `(Anonymous function)`

___
<a id="writepackagereferences"></a>

### `<Const>` writePackageReferences

▸ **writePackageReferences**(dryRun: *`boolean`*): `any`

*Defined in [typescript-build-linker.ts:176](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L176)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| dryRun | `boolean` |

**Returns:** `any`

___
<a id="writeparentreferences"></a>

### `<Const>` writeParentReferences

▸ **writeParentReferences**(dryRun: *`boolean`*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:225](https://github.com/typescript-tools/typescript-build-linker/blob/a78da0e/src/typescript-build-linker.ts#L225)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| dryRun | `boolean` |

**Returns:** `(Anonymous function)`

___

