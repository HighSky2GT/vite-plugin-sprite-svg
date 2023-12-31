import { expect, test } from 'vitest'
import { createSymbolId } from '../src/index'

const TEST_SYMBOL_ID = 'icon-[dir]-[name]'
test('createSymbolId test', () => {
  const options = { svgSymbolId: TEST_SYMBOL_ID } as any

  const normalId = createSymbolId('file.svg', options)
  const dirId = createSymbolId('dir/file.svg', options)
  const folderId = createSymbolId('folder/dir/file.svg', options)
  const specialId = createSymbolId('folder/dir/.file.svg', options)

  expect(normalId).toBe('icon-file')
  expect(dirId).toBe('icon-dir-file')
  expect(folderId).toBe('icon-folder-dir-file')
  expect(specialId).toBe('icon-folder-dir-.file')
})

test('createSymbolId Not dir', () => {
  const id = createSymbolId('dir/file.svg', { svgSymbolId: 'icon-[name]' } as any)

  expect(id).toBe('icon-dir/file')
})
