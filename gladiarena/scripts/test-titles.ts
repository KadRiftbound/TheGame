import assert from 'node:assert/strict'
import { parseUnlockedTitleIds, sortTitleIdsByDefinitionOrder, TITLE_DEFINITIONS } from '../src/lib/titles'

function run() {
  const parsedLegacy = parseUnlockedTitleIds('["novice","m millionaire","novice","unknown"]')
  assert.deepEqual(parsedLegacy, ['novice', 'millionnaire'])

  const parsedCorrupt = parseUnlockedTitleIds('{broken-json')
  assert.deepEqual(parsedCorrupt, [])

  const parsedNotArray = parseUnlockedTitleIds('{"foo":"bar"}')
  assert.deepEqual(parsedNotArray, [])

  const mixed = sortTitleIdsByDefinitionOrder(['millionnaire', 'novice', 'fuyard'])
  const orderReference = TITLE_DEFINITIONS.map((title) => title.id)
  assert.equal(orderReference.indexOf(mixed[0]) <= orderReference.indexOf(mixed[1]), true)
  assert.deepEqual(mixed, ['novice', 'millionnaire', 'fuyard'])

  console.log('titles tests passed')
}

run()
