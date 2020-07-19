## postgres-partial
**This is in experimental state and may be deprecated when partial query has official support.**

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
  sql`SELECT id FROM example ${limit ? sql.partial`LIMIT ${limit}` : sql.skip}`
}
// This will translate into below when limit is an truthy value.
SELECT id FROM example LIMIT $1
// And translate into below when limit is an falsy value.
SELECT id FROM example
```

