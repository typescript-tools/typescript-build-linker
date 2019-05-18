
typescript-build-linker [![Build status](https://travis-ci.org/typescript-tools/typescript-build-linker.svg?branch=master)](https://travis-ci.org/typescript-tools/typescript-build-linker) [![npm version](https://img.shields.io/npm/v/@typescript-tools/typescript-build-linker.svg)](https://npmjs.org/package/@typescript-tools/typescript-build-linker) [![codecov](https://codecov.io/gh/typescript-tools/typescript-build-linker/branch/master/graph/badge.svg)](https://codecov.io/gh/typescript-tools/typescript-build-linker)
========================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================

> Link together packages in a mono-repo

Install
-------

```shell
npm install @typescript-tools/typescript-build-linker
```

Use
---

```typescript
import { typescriptBuildLinker } from '@typescript-tools/typescript-build-linker'
// TODO: describe usage
```

Related
-------

TODO

Acknowledgments
---------------

TODO

## Index

### Variables

* [directoriesContainingPackages](#directoriescontainingpackages)
* [packageDependencies](#packagedependencies)
* [packageDirectories](#packagedirectories)
* [packageJsons](#packagejsons)
* [packageNames](#packagenames)
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
        uniquify)

*Defined in [typescript-build-linker.ts:171](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L171)*

___
<a id="packagedependencies"></a>

### `<Const>` packageDependencies

**● packageDependencies**: *`any`* = 
    compose(
        packageJsons,
        map(jsonDependencies))

*Defined in [typescript-build-linker.ts:104](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L104)*

___
<a id="packagedirectories"></a>

### `<Const>` packageDirectories

**● packageDirectories**: *`any`* = 
    compose(
        packageJsons,
        map(path.dirname))

*Defined in [typescript-build-linker.ts:81](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L81)*

___
<a id="packagejsons"></a>

### `<Const>` packageJsons

**● packageJsons**: *`any`* = 
    memoize(
        compose(
            globby.sync.bind(null),
            filter(filename => !filename.includes('node_modules')),
            filter(filename => filename.includes('package.json'))))

*Defined in [typescript-build-linker.ts:73](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L73)*

___
<a id="packagenames"></a>

### `<Const>` packageNames

**● packageNames**: *`any`* = 
    compose(
        packageJsons,
        map(readJson),
        map(prop('name')))

*Defined in [typescript-build-linker.ts:87](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L87)*

___
<a id="readjson"></a>

### `<Const>` readJson

**● readJson**: *`any`* =  compose(
    id,  // DISCUSS: why is this `id` necessary?
    fs.readFileSync,
    JSON.parse.bind(null)
)

*Defined in [typescript-build-linker.ts:66](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L66)*

___

## Functions

<a id="internalpackagedependencies"></a>

### `<Const>` internalPackageDependencies

▸ **internalPackageDependencies**(globs: *`Glob`[]*): `File`[]

*Defined in [typescript-build-linker.ts:109](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L109)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| globs | `Glob`[] |

**Returns:** `File`[]

___
<a id="internalpackagepath"></a>

### `<Const>` internalPackagePath

▸ **internalPackagePath**(glob: *`Glob`[]*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:123](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L123)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| glob | `Glob`[] |

**Returns:** `(Anonymous function)`

___
<a id="topackagereferences"></a>

### `<Const>` toPackageReferences

▸ **toPackageReferences**(__namedParameters: *[`string`, `Array`]*): [`File`, `References`]

*Defined in [typescript-build-linker.ts:127](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L127)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| __namedParameters | [`string`, `Array`] |

**Returns:** [`File`, `References`]

___
<a id="toparentreferences"></a>

### `<Const>` toParentReferences

▸ **toParentReferences**(packages: *`File`[]*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:199](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L199)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| packages | `File`[] |

**Returns:** `(Anonymous function)`

___
<a id="writepackagereferences"></a>

### `<Const>` writePackageReferences

▸ **writePackageReferences**(dryRun: *`boolean`*): `any`

*Defined in [typescript-build-linker.ts:163](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L163)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| dryRun | `boolean` |

**Returns:** `any`

___
<a id="writeparentreferences"></a>

### `<Const>` writeParentReferences

▸ **writeParentReferences**(dryRun: *`boolean`*): `(Anonymous function)`

*Defined in [typescript-build-linker.ts:205](https://github.com/typescript-tools/typescript-build-linker/blob/bfd2fd6/src/typescript-build-linker.ts#L205)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| dryRun | `boolean` |

**Returns:** `(Anonymous function)`

___

