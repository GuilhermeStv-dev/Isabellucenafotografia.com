import { getStoragePathFromPublicUrl, getTransformedFotoUrl } from './supabase'

const DEFAULT_WIDTHS = [640, 1024, 1600]
const DEFAULT_QUALITIES = [70, 72, 75]
const ENABLE_SUPABASE_TRANSFORMS = import.meta.env.VITE_ENABLE_SUPABASE_IMAGE_TRANSFORM !== 'false'

const isUnsplashUrl = (url = '') => url.includes('images.unsplash.com/')

const buildUnsplashUrl = (url, width, quality) => {
  const base = url.split('?')[0]
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`
}

const buildUnsplashSet = (url, widths, qualities) =>
  widths
    .map((width, idx) => `${buildUnsplashUrl(url, width, qualities[idx] ?? qualities[qualities.length - 1] ?? 75)} ${width}w`)
    .join(', ')

const buildSupabaseSet = (path, widths, qualities) =>
  widths
    .map((width, idx) => {
      const quality = qualities[idx] ?? qualities[qualities.length - 1] ?? 75
      return `${getTransformedFotoUrl(path, { width, quality })} ${width}w`
    })
    .join(', ')

export function getResponsiveImageSources(url, options = {}) {
  const widths = options.widths || DEFAULT_WIDTHS
  const qualities = options.qualities || DEFAULT_QUALITIES
  const fallbackWidth = options.fallbackWidth || widths[widths.length - 1] || 1600
  const fallbackQuality = options.fallbackQuality || qualities[qualities.length - 1] || 75

  if (!url) return { src: '', srcSet: undefined, fallbackSrc: '' }

  if (isUnsplashUrl(url)) {
    return {
      src: buildUnsplashUrl(url, fallbackWidth, fallbackQuality),
      srcSet: buildUnsplashSet(url, widths, qualities),
      fallbackSrc: url,
    }
  }

  const storagePath = getStoragePathFromPublicUrl(url)
  if (storagePath && ENABLE_SUPABASE_TRANSFORMS) {
    return {
      src: getTransformedFotoUrl(storagePath, { width: fallbackWidth, quality: fallbackQuality }),
      srcSet: buildSupabaseSet(storagePath, widths, qualities),
      fallbackSrc: url,
    }
  }

  return { src: url, srcSet: undefined, fallbackSrc: url }
}
