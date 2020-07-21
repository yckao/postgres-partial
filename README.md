## postgres-partial
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/yckao/postgres-partial/Test)](https://github.com/yckao/postgres-partial/actions)
[![GitHub](https://img.shields.io/github/license/yckao/postgres-partial)](https://github.com/yckao/postgres-partial/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/yckao/postgres-partial/branch/master/graph/badge.svg)](https://codecov.io/gh/yckao/postgres-partial)
[![npm](https://img.shields.io/npm/dw/postgres-partial)](https://www.npmjs.com/package/postgres-partial)
[![npm](https://img.shields.io/npm/v/postgres-partial)](https://www.npmjs.com/package/postgres-partial)

**This is in experimental state and may be deprecate when partial query has official support.**

**Only tested on postgres@beta**

This package is a simple wrapper providing two feature.

One is partial, that can dynamic build an query and also benefit from postgres's Tagged template system.

Other is skip, that can skip an block when it isn't needed.

More detail you can look below.

## Getting started

**Install**

```bash
$ npm install postgres-partial
```

**Use**

You need to use wrap function to wrap an existed sql instance

```js
const postgres = require("postgres");
const partial = require("postgres-partial");
const sql = partial.wrap(postgres());

module.exports = sql;
```

## Skip
You can skip an param block using `sql.skip`
```js
const row = sql`SELECT ${sql.skip} 1`
// will equal to
const row = sql`SELECT 1`
```

## Partial
You can use Partial to provide query out of sql``
```js
const foo = sql.partial`${'bar'} as foo`
const [row] = await sql`SELECT ${foo}`
// will translate to
SELECT $1 as foo
// and row will equal to 
{foo: 'bar'}

```

## Partial and Skip

You can mix Partial and Skip to provide dynamic queries.
```js
function (limit) {
  await sql`SELECT id FROM example ${limit ? sql.partial`LIMIT ${limit}` : sql.skip}`
  // or
  const limitQuery = limit ? sql.partial`LIMIT ${limit}` : sql.skip}`
  await sql`SELECT id FROM example ${limitQuery}`
}
// This will translate into below when limit is an truthy value.
SELECT id FROM example LIMIT $1
// And translate into below when limit is an falsy value.
SELECT id FROM example
```

