import type { Plugin, ResolvedConfig } from 'vite'

import { normalizePath } from 'vite'
import fg from 'fast-glob'
import getEtag from 'etag'
import cors from 'cors'
import fs from 'fs-extra'
import SVGCompiler from 'svg-baker'
import { optimize } from 'svgo'
import { DomLocation, type FileCache, type ViteSvgPluginConfig } from './types'
import { extname } from './utils'

const SVG_PLUGIN_NAME = 'virtual:sprite-svg'
const SVG_ICONS = '~svgIcons'
const SVG_DOM_ID = '__sprite__svg__dom__'
const XMLNS = 'http://www.w3.org/2000/svg'
const XMLNS_LINK = 'http://www.w3.org/1999/xlink'
export function createSpriteSvgPlugin(opt: ViteSvgPluginConfig): Plugin {
  const cache = new Map<string, FileCache>()

  let isBuild = false
  const options = {
    svgSymbolId: 'icon-[dir]-[name]',
    domLocation: DomLocation.BODY_END,
    svgDomId: SVG_DOM_ID,
    ...opt,
  }

  const { svgSymbolId } = options

  if (!svgSymbolId?.includes('[name]'))
    throw new Error('SymbolId must contain [name] string!')

  return {
    name: 'vite-plugin-sprite-svg',
    configResolved(resolvedConfig: ResolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)

        const registerId = `/@id/${SVG_PLUGIN_NAME}`
        const clientId = `/@id/${SVG_ICONS}`
        if ([clientId, registerId].some(item => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { code, idSet } = await createModuleCode(
            cache,
            options,
          )
          const content = url.endsWith(registerId) ? code : idSet

          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        }
        else {
          next()
        }
      })
    },

    resolveId(id) {
      return [SVG_PLUGIN_NAME, SVG_ICONS].includes(id) ? id : null
    },

    async load(id, ssr) {
      if (!isBuild && !ssr)
        return null

      const isRegister = id.endsWith(SVG_PLUGIN_NAME)
      const isClient = id.endsWith(SVG_ICONS)

      if (ssr && !isBuild && (isRegister || isClient))
        return 'export default {}'

      const { code, idSet } = await createModuleCode(
        cache,
        options,
      )
      if (isRegister)
        return code
      if (isClient)
        return idSet
    },
  }
}

async function createModuleCode(
  cache: Map<string, FileCache>,
  options: ViteSvgPluginConfig,
) {
  const { insertHtml, idSet } = await compilerAllSvg(cache, options)

  const xmlns = `xmlns="${XMLNS}"`
  const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`
  const html = insertHtml
    .replace(new RegExp(xmlns, 'g'), '')
    .replace(new RegExp(xmlnsLink, 'g'), '')
  const jsonHtml = JSON.stringify(html)
  const code = `
       if (typeof window !== 'undefined') {
         function loadSvgSprite() {
           var body = document.body;
           var dom = document.getElementById('${options.svgDomId}');
           if(!dom) {
             dom = document.createElementNS('${XMLNS}', 'svg');
             dom.id = '${options.svgDomId}';
             dom.setAttribute('xmlns','${XMLNS}');
             dom.setAttribute('xmlns:link','${XMLNS_LINK}');
             dom.style.position = 'absolute';
             dom.style.width = '0';
             dom.style.height = '0';
           }
           dom.innerHTML = ${jsonHtml};
           ${domInject(options.domLocation)}
         }
         if(document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', loadSvgSprite);
         } else {
          loadSvgSprite()
         }
      }
        `
  return {
    code: `${code}\nexport default {}`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  }
}

function domInject(inject: DomLocation = DomLocation.BODY_END) {
  switch (inject) {
    case DomLocation.BODY_END:
      return 'body.insertBefore(dom, body.lastChild);'
    default:
      return 'body.insertBefore(dom, body.firstChild);'
  }
}

async function compilerAllSvg(
  cache: Map<string, FileCache>,
  options: ViteSvgPluginConfig,
) {
  const { dirs } = options

  let insertHtml = ''
  const idSet = new Set<string>()

  for (const dir of dirs) {
    const svgFilsStats = fg.sync('**/*.svg', {
      cwd: dir,
      stats: true,
      absolute: true,
    })

    for (const entry of svgFilsStats) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cacheStat = cache.get(path)
      let svgSymbol
      let symbolId
      let relativeName = ''

      const getSymbol = async () => {
        relativeName = normalizePath(path).replace(normalizePath(`${dir}/`), '')
        symbolId = createSymbolId(relativeName, options)
        svgSymbol = await compilerSvg(path, symbolId)
        idSet.add(symbolId)
      }

      if (cacheStat) {
        if (cacheStat.mtimeMs !== mtimeMs) {
          await getSymbol()
        }
        else {
          svgSymbol = cacheStat.code
          symbolId = cacheStat.symbolId
          symbolId && idSet.add(symbolId)
        }
      }
      else {
        await getSymbol()
      }

      svgSymbol && cache.set(path, {
        mtimeMs,
        relativeName,
        code: svgSymbol,
        symbolId,
      })
      insertHtml += `${svgSymbol || ''}`
    }
  }
  return { insertHtml, idSet }
}

async function compilerSvg(
  file: string,
  symbolId: string,
): Promise<string | null> {
  if (!file)
    return null

  let content = fs.readFileSync(file, 'utf-8')

  const { data } = optimize(content)
  content = data || content

  const svgSymbol = await new SVGCompiler().addSymbol({
    id: symbolId,
    content,
    path: file,
  })
  return svgSymbol.render()
}

function createSymbolId(name: string, options: ViteSvgPluginConfig) {
  const { svgSymbolId: symbolId } = options

  if (!symbolId)
    return name

  let id = symbolId
  let fName = name

  const { fileName = '', dirName } = discreteDir(name)
  if (symbolId.includes('[dir]')) {
    id = id.replace(/\[dir\]/g, dirName)
    if (!dirName)
      id = id.replace('--', '-')
    fName = fileName
  }
  id = id.replace(/\[name\]/g, fName)
  return id.replace(extname(id), '')
}

function discreteDir(name: string) {
  if (!normalizePath(name).includes('/')) {
    return {
      fileName: name,
      dirName: '',
    }
  }
  const strList = name.split('/')
  const fileName = strList.pop()
  const dirName = strList.join('-')
  return { fileName, dirName }
}
