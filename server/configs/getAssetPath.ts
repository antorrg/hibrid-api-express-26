import path from 'node:path'
import fs from 'node:fs'
import envConfig from './envConfig.js'

interface ManifestChunk {
  file: string
  src?: string
  name?: string
  isEntry?: boolean
  css?: string[]
  assets?: string[]
}

let manifest: Record<string, ManifestChunk> | undefined

if (envConfig.Status === 'production') {
  try {
    const manifestPath = path.resolve('dist/.vite/manifest.json')
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    }
  } catch (err) {
    console.error('Error loading Vite manifest:', err)
  }
}

export function getAssetPath(assetName: string): string {
  if (envConfig.Status === 'production' && manifest) {
    // 1. Caso index.css: extraer el CSS del chunk principal
    if (assetName === 'index.css') {
      const mainEntry = manifest['src/main.tsx'] || manifest['src/main.jsx']
      if (mainEntry?.css?.[0]) {
        return `/${mainEntry.css[0]}`
      }
      const cssEntry = Object.values(manifest).find((item) => item.file.endsWith('.css'))
      if (cssEntry) return `/${cssEntry.file}`
    }

    // 2. Caso index.js (entry de React)
    if (assetName === 'index.js') {
      const mainEntry = manifest['src/main.tsx'] || manifest['src/main.jsx']
      if (mainEntry?.file) {
        return `/${mainEntry.file}`
      }
    }

    // 3. Caso scripts.js
    if (assetName === 'scripts.js') {
      const scriptsEntry = manifest['src/files/scripts.js']
      if (scriptsEntry?.file) {
        return `/${scriptsEntry.file}`
      }
    }

    // 4. Búsqueda genérica por ruta de origen o por nombre
    const directKey = `src/files/${assetName}`
    if (manifest[directKey]?.file) {
      return `/${manifest[directKey].file}`
    }

    const byName = Object.values(manifest).find(
      (item) => item.name === assetName.replace(/\.[^.]+$/, '') || item.file.endsWith(assetName)
    )
    if (byName?.file) {
      return `/${byName.file}`
    }

    return `/${assetName}`
  }

  // Modo desarrollo / fallback
  if (assetName === 'index.js') return '/main.tsx'
  if (assetName === 'index.css') return '/index.css'
  if (assetName === 'scripts.js') return '/files/scripts.js'

  return `/${assetName}`
}