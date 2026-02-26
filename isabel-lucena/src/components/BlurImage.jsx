import { useState, memo } from 'react'

function BlurImage({
  src,
  srcSet,
  sizes,
  alt = '',
  placeholder,
  className = '',
  loading = 'lazy',
  fetchPriority,
  decoding = 'async',
  onLoad,
  onError,
  style,
}) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = (e) => {
    setLoaded(true)
    onError?.(e)
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-500 ${
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {placeholder ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${placeholder}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.15)',
            }}
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]" />
        )}
      </div>

      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        style={style}
        className={`transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </>
  )
}

export default memo(BlurImage)