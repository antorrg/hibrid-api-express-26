import path from 'node:path'
import fs from 'node:fs'
import envConfig from './envConfig.js'

let manifest: Record<string, { file?: string }> | undefined

if (envConfig.Status === 'production') {
  const manifestPath = path.resolve('dist/.vite/manifest.json')
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
}
export function getAssetPath(assetName: string) {
  if (envConfig.Status === 'production') {
    const key = `src/files/${assetName}`
    if (manifest?.[key]) {
      return `/${assetName}` // O `/${manifest[key].file}` si prefieres esa lógica
    }
    //console.warn(`Asset "${assetName}" no encontrado en el manifest.`);
    console.log('asset', assetName)
    return assetName
  }
  return `/files/${assetName}`
}