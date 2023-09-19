import path from 'node:path'

function normalizeWindowsPath(input = '') {
  if (!input.includes('\\'))
    return input
  return input.replace(/\\/g, '/')
}

export function extname(p: string) {
  return path.posix.extname(normalizeWindowsPath(p))
}
