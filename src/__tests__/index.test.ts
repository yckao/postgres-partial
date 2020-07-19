import { wrap, SqlWithDynamic } from '..'
import postgres from 'postgres'
const connectionURL = process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost/postgres_partial'

describe('dynamic integration tests', () => {
  let sql: SqlWithDynamic<never>

  beforeAll(async () => {
    sql = wrap(postgres(connectionURL, {
      debug: (_, query, params) => {
        console.log(query, params)
      }
    }))
  })

  afterAll(async () => {
    await sql.end()
  })

  test('skip should not break the query', async () => {
    const rows = await sql`SELECT 'bar' as foo ${sql.skip}`
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ foo: 'bar' })
  })

  test('single layer partial query', async () => {
    const rows = await sql`SELECT ${sql.partial`'bar' as foo`}`
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ foo: 'bar' })
  })

  test('multi layer partial query', async () => {
    const layer1 = sql.partial`${'bar'}`
    const layer2 = sql.partial`${layer1} as foo`
    const rows = await sql`SELECT ${layer2}`
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ foo: 'bar' })
  })

  test('multi layer partial query', async () => {
    const layer1 = sql.partial`foo`
    const layer2 = sql.partial`${'bar'} as ${layer1}`
    const rows = await sql`SELECT ${layer2}`
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({ foo: 'bar' })
  })

  test('with json', async () => {
    const test = sql.partial`${sql.json({ foo: 'bar' })}`
    const [row] = await sql`SELECT ${test} as json`
    expect(row.json).toEqual({ foo: 'bar' })
  })
})
