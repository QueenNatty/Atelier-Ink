'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PORTFOLIO_IMAGES } from '@/lib/images'
import SmartImage from '@/components/ui/SmartImage'

const TAGS = ['All', 'Fine Line', 'Blackwork', 'Afrocentric', 'Geometric', 'Piercing', 'Neo-Traditional', 'Single Needle']

export default function PortfolioGrid() {
  const [activeTag, setActiveTag] = useState('All')
  const [lightbox, setLightbox] = useState<typeof PORTFOLIO_IMAGES[0] | null>(null)

  const filtered = activeTag === 'All'
    ? PORTFOLIO_IMAGES
    : PORTFOLIO_IMAGES.filter((p) => p.tag === activeTag)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={cn(
              'font-body text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200',
              activeTag === tag
                ? 'border-gold text-gold bg-gold/10'
                : 'border-ink-steel text-ink-ash hover:border-ink-smoke hover:text-ink-mist'
            )}>
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'relative overflow-hidden group cursor-pointer bg-ink-graphite',
              item.featured && i === 0 ? 'col-span-2 row-span-2' : 'aspect-square'
            )}
            style={{ aspectRatio: item.featured && i === 0 ? 'auto' : '1' }}
            onClick={() => setLightbox(item)}
          >
            <SmartImage
              local={item.local}
              fallback={item.fallback}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/40 transition-all duration-300 flex items-end p-4">
              <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="section-label block mb-1">{item.tag}</span>
                <p className="font-body text-xs text-ink-mist">{item.alt}</p>
              </div>
              <ZoomIn size={20} className="absolute top-4 right-4 text-ink-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-ink-silver hover:text-gold transition-colors" aria-label="Close">
            <X size={28} />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <SmartImage
              local={lightbox.local}
              fallback={lightbox.fallback}
              alt={lightbox.alt}
              width={900}
              height={900}
              className="object-contain w-full h-full"
            />
            <div className="mt-4 flex items-center gap-4">
              <span className="section-label">{lightbox.tag}</span>
              <p className="font-body text-sm text-ink-silver">{lightbox.alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
