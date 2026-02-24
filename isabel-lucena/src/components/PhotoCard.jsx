import { useState } from 'react'
import { Eye, Heart, MessageCircle } from 'lucide-react'

export default function PhotoCard({ photo, onClick }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group bg-dark-surface"
      onClick={() => onClick && onClick(photo)}
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={photo.url}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105
            ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded && (
          <div className="absolute inset-0 bg-dark-surface animate-pulse" />
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center gap-4 text-white/80 text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <span className="flex items-center gap-1">
            <Eye size={13} /> {photo.views ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={13} /> {photo.likes ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} /> {photo.comments ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}
