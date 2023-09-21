export enum DomLocation {
  BODY_START,
  BODY_END,
}

export interface ViteSvgPluginConfig {
  /**
   * 资源路径
   */
  dirs: string[]
  /**
   * icon format
   * svg id格式
   * @default: icon-[dir]-[name]
   */
  svgSymbolId?: string

  /**
   * 插入位置，默认插入在body标签内的最后一个
   * @default: DomLocation.BODY_END
   */
  domLocation?: DomLocation

  /**
   * 自定义插入的svg元素id
   * @default: __sprite__svg__dom__
   */
  svgDomId?: string
}

export interface FileCache {
  relativeName: string
  mtimeMs?: number
  code: string
  symbolId?: string
}
