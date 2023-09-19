import SvgSprite from "./vue/index"

declare module 'virtual:sprite-svg' {
  // eslint-disable-next-line
  const component: any
  export default component
}

declare module '~svgIcons' {
  // eslint-disable-next-line
  const iconsNames: string[]
  export default iconsNames
}


declare module 'vue' {
  export interface GlobalComponents {
    SvgSprite: typeof SvgSprite
  }
}

