export enum DomLocation {
  BODY_START,
  BODY_END,
}

export interface Config {
  dirs: string[]
  svgSymbolId?: string
  domLocation?: DomLocation
  svgDomId?: string
}

export interface FileCache {
  relativeName: string
  mtimeMs?: number
  code: string
  symbolId?: string
}
