export async function generatePlaceholder(fileOrBlob, size = 20) {
  return new Promise((resolve) => {
    if (!fileOrBlob) { resolve(null); return }

    const img = new Image()
    const objectUrl = URL.createObjectURL(fileOrBlob)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        const ratio = img.naturalHeight / img.naturalWidth || 1
        const w = size
        const h = Math.max(1, Math.round(size * ratio))

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)

        const dataUrl = canvas.toDataURL('image/webp', 0.6)
        resolve(dataUrl.startsWith('data:image') ? dataUrl : canvas.toDataURL('image/jpeg', 0.6))
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}