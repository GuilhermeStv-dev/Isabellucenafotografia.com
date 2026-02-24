/**
 * Comprime uma imagem usando o Canvas do browser.
 * Reduz o tamanho do arquivo antes do upload sem dependências externas.
 *
 * @param {File} file       - Arquivo de imagem original
 * @param {number} maxWidth - Largura máxima em pixels (padrão: 2048)
 * @param {number} quality  - Qualidade 0–1 (padrão: 0.85)
 * @returns {Promise<Blob>}  - Blob comprimido em WebP (com fallback para JPEG)
 */
export async function compressImage(file, maxWidth = 2048, quality = 0.85) {
  // Suporte a WebP garante melhor compressão no upload
  const supportsWebP = await checkWebPSupport()
  const outputType = supportsWebP ? 'image/webp' : 'image/jpeg'

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Redimensiona mantendo proporção
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback: usa o arquivo original se o canvas falhar
            resolve(file)
            return
          }

          // Só usa o comprimido se for menor que o original
          if (blob.size < file.size) {
            resolve(blob)
          } else {
            resolve(file)
          }
        },
        outputType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // fallback: upload original
    }

    img.src = objectUrl
  })
}

let webPSupportCache = null

async function checkWebPSupport() {
  if (webPSupportCache !== null) return webPSupportCache
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { webPSupportCache = img.width > 0; resolve(webPSupportCache) }
    img.onerror = () => { webPSupportCache = false; resolve(false) }
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAkA4JYgCdAEO/gHOAAA='
  })
}

/**
 * Executa promises com limite de concorrência.
 * Evita sobrecarregar o servidor com uploads simultâneos.
 *
 * @param {Array<() => Promise>} tasks - Array de funções que retornam Promise
 * @param {number} concurrency         - Máximo de tasks simultâneas
 */
export async function runWithConcurrency(tasks, concurrency = 3) {
  const results = []
  const queue = [...tasks]

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()
      if (task) results.push(await task())
    }
  })

  await Promise.all(workers)
  return results
}
