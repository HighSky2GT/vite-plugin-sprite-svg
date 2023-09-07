import type { Config } from 'svgo'

export enum DomLocation {
  BODY_START,
  BODY_END
}

export interface ViteSvgPluginConfig {
  /**
   * 资源路径
   */
  dirs: string[]

  /**
   * svgo 配置,用于压缩svg used to compress svg
   * @default：true
   */
  svgoConfig?: boolean | Config

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
   * @default: __svg__icons__dom__
   */
  svgId?: string
}

export interface FileCache {
  relativeName: string
  mtimeMs?: number
  code: string
  symbolId?: string
}