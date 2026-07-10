'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, User } from 'lucide-react'
import { studioApi } from '@/lib/api'
import type { ArtistList } from '@/types'
import { ARTIST_IMAGES, ARTIST_FALLBACKS } from '@/lib/images'
import SmartImage from '@/components/ui/SmartImage'

const FALLBACK_ARTISTS: ArtistList[] = [
  {
    id: 1, full_name: 'Adaeze Okonkwo',
    bio: 'Lagos-based fine line artist specialising in Afrocentric motifs, botanicals, and abstract geometry. 7 years bringing intentional, lasting work to dark and light skin tones.',
    specialty_names: ['Fine Line', 'Afrocentric', 'Botanical'],
    avatar_url: null, is_accepting_clients: true, years_experience: 7,
  },
  {
    id: 2, full_name: 'Emeka Nwosu',
    bio: 'Neo-traditional and blackwork specialist. Draws from Igbo uli patterns and Yoruba adire textile art. Each piece is a conversation between heritage and modern tattooing.',
    specialty_names: ['Blackwork', 'Neo-Traditional', 'Uli Patterns'],
    avatar_url: null, is_accepting_clients: true, years_experience: 9,
  },
  {
    id: 3, full_name: 'Zainab Bello',
    bio: 'Piercing specialist and minimalist tattoo artist. Trained in London, based in Lagos. Known for clean, precise piercings and delicate micro-scripts.',
    specialty_names: ['Piercing', 'Micro-Script', 'Minimalist'],
    avatar_url: null, is_accepting_clients: true, years_experience: 5,
  },
]

// Maps known artist names → local image keys in ARTIST_IMAGES
const KNOWN_ARTISTS: Record<string, string> = {
  'Adaeze Okonkwo': 'adaeze',
  'Emeka Nwosu': 'emeka',
  'Zainab Bello': 'zainab',
}

function ArtistPhoto({ artist }: { artist: ArtistList }) {
  const key = KNOWN_ARTISTS[artist.full_name]
  const local = key ? ARTIST_IMAGES[key] : ''
  const remote = artist.avatar_url || (key ? ARTIST_FALLBACKS[key] : '')

  if (local || remote) {
    return (
      <SmartImage
        local={local || remote}
        fallback={remote || local}
        alt={artist.full_name}
        fill
        className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
      />
    )
  }

  // New artist added via staff portal with no photo yet — show initials
  const initials = artist.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-full h-full flex items-center justify-center bg-ink-graphite">
      <span className="font-display text-5xl font-light text-ink-smoke">{initials}</span>
    </div>
  )
}

export default function ArtistsSection() {
  const [artists, setArtists] = useState<ArtistList[] | null>(null)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    studioApi.getArtists()
      .then(res => setArtists(res.data.length > 0 ? res.data : FALLBACK_ARTISTS))
      .catch(() => { setApiError(true); setArtists(FALLBACK_ARTISTS) })
  }, [])

  const display = artists ?? FALLBACK_ARTISTS

  return (
    <>
      {apiError && (
        <p className="font-body text-xs text-ink-ash mb-6 opacity-60">
          Showing cached data — backend may be offline.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {display.map(artist => (
          <div key={artist.id}
            className="card-ink group overflow-hidden flex flex-col transition-all duration-300 hover:border-ink-smoke hover:-translate-y-1">

            <div className="relative h-72 overflow-hidden bg-ink-graphite flex-shrink-0">
              <ArtistPhoto artist={artist} />
              <div className="absolute top-4 right-4">
                <span className={`font-body text-2xs tracking-widest uppercase px-3 py-1 ${
                  artist.is_accepting_clients ? 'bg-gold text-ink-black' : 'bg-ink-steel text-ink-ash'
                }`}>
                  {artist.is_accepting_clients ? 'Booking' : 'Waitlist'}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="mb-3">
                <h3 className="font-display text-2xl font-light text-ink-white">{artist.full_name}</h3>
                <p className="font-body text-xs text-ink-ash mt-1">
                  {artist.years_experience} years experience · Lagos, NG
                </p>
              </div>

              <p className="font-body text-sm text-ink-silver leading-relaxed mb-4 flex-1 line-clamp-3">
                {artist.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {artist.specialty_names.slice(0, 3).map(s => (
                  <span key={s} className="font-body text-2xs tracking-widest uppercase text-gold border border-gold/30 px-2 py-1">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-ink-steel">
                {artist.is_accepting_clients ? (
                  <Link href={`/book?artist=${artist.id}`}
                    className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors group/link">
                    Book with {artist.full_name.split(' ')[0]}
                    <ArrowRight size={12} className="transition-transform duration-200 group-hover/link:translate-x-1" />
                  </Link>
                ) : (
                  <span className="font-body text-xs tracking-widest uppercase text-ink-ash">
                    Currently on waitlist
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
