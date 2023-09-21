# vite-plugin-sprite-svg
vite中用于生成svg精灵图的插件

# 使用
## 1. 安装
```bash
yarn add vite-plugin-sprite-svg -D
# or
npm i vite-plugin-sprite-svg -D
# or
pnpm i vite-plugin-sprite-svg -D
```
## 2. 配置
- vite.config.ts中的配置
```ts
import path from 'path'
import { defineConfig } from 'vite'
import createSvg from 'vite-plugin-sprite-svg'

export default defineConfig(() => {
  const svgConfig: ViteSvgPluginConfig = {
    /**
     * 该文件夹下的svg文件会被生成精灵图
     * 可选，默认为 'src/icons'
     */
    dirs: [path.resolve(process.cwd(), 'src/icons')],
    /**
     * 指定symbolId格式
     * 可选，默认 'icon-[dir]-[name]'
     */
    symbolId: 'icon-[dir]-[name]',
    /**
     * 精灵图插入位置
     * DomLocation.BODY_START ：body的顶部
     * DomLocation.BODY_END ：body的底部
     * 可选，默认为 DomLocation.BODY_END
     */
    domLocation: DomLocation.BODY_END,
    /**
     * 精灵图dom的id
     * 可选，默认为 '__sprite__svg__dom__'
     */
    svgDomId: '__sprite__svg__dom__',
    /**
     * custom dom id
     * @default: __svg__icons__dom__
     */
    customDomId: '__svg__icons__dom__'
  }

  return {
    plugins: [
      createSvg(svgConfig),
    ],
  }
})
```

- 在src/main.ts中引入注册脚本
```ts
import 'virtual:sprite-svg'
```
## 查看所有svg图片名
```ts
import svgIcons from '~svgIcons'
```