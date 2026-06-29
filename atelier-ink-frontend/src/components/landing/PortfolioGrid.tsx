'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

// Curated placeholder portfolio using diverse Black model photography from Unsplash
const PORTFOLIO = [
  { id: 1, url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&q=80', alt: 'Fine line botanical arm piece', tag: 'Fine Line', featured: true },
  { id: 2, url: 'https://images.unsplash.com/photo-1542451542907-6b49b8d3b4c2?w=800&q=80', alt: 'Black & grey portrait sleeve', tag: 'Portrait', featured: false },
  { id: 3, url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80', alt: 'Geometric chest piece', tag: 'Geometric', featured: false },
  { id: 4, url: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80', alt: 'Micro realism florals', tag: 'Realism', featured: true },
  { id: 5, url: 'https://images.unsplash.com/photo-1590246814883-57c511e68b1c?w=800&q=80', alt: 'Japanese traditional koi', tag: 'Traditional', featured: false },
  { id: 6, url: 'https://images.unsplash.com/photo-1611091057873-e1a7bf78b63f?w=800&q=80', alt: 'Neo-traditional wolf', tag: 'Neo-Traditional', featured: false },
  { id: 7, url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80', alt: 'Minimalist single needle', tag: 'Single Needle', featured: false },
  { id: 8, url: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80', alt: 'Blackwork mandala back piece', tag: 'Blackwork', featured: true },
]

const TAGS = ['All', 'Fine Line', 'Portrait', 'Geometric', 'Realism', 'Traditional', 'Blackwork']

export default function PortfolioGrid() {
  const [activeTag, setActiveTag] = useState('All')
  const [lightbox, setLightbox] = useState<typeof PORTFOLIO[0] | null>(null)

  const filtered = activeTag === 'All'
    ? PORTFOLIO
    : PORTFOLIO.filter((p) => p.tag === activeTag)

  return (
    <>
      {/* Filter tags */}
      <div className="flex flex-wrap gap-2 mb-10">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              'font-body text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200',
              activeTag === tag
                ? 'border-gold text-gold bg-gold/10'
                : 'border-ink-steel text-ink-ash hover:border-ink-smoke hover:text-ink-mist'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
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
            <Image
              src={item.url}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/40 transition-all duration-300 flex items-end p-4">
              <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="section-label block mb-1">{item.tag}</span>
                <p className="font-body text-xs text-ink-mist">{item.alt}</p>
              </div>
              <ZoomIn
                size={20}
                className="absolute top-4 right-4 text-ink-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-ink-silver hover:text-gold transition-colors"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.url}
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
