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
    avatar_url: null, is_accepting_clients: false, years_experience: 5,
  },
]

const ARTIST_KEY: Record<string, string> = {
  'Adaeze Okonkwo': 'adaeze',
  'Emeka Nwosu': 'emeka',
  'Zainab Bello': 'zainab',
}

export default function ArtistsSection() {
  const [artists, setArtists] = useState<ArtistList[]>(FALLBACK_ARTISTS)

  useEffect(() => {
    studioApi.getArtists()
      .then((res) => { if (res.data.length > 0) setArtists(res.data) })
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map((artist) => {
        const key = ARTIST_KEY[artist.full_name] || 'adaeze'
        const localImg = ARTIST_IMAGES[key]
        const fallbackImg = artist.avatar_url || ARTIST_FALLBACKS[key]

        return (
          <div key={artist.id}
            className="card-ink group overflow-hidden flex flex-col transition-all duration-300 hover:border-ink-smoke hover:-translate-y-1">
            {/* Photo */}
            <div className="relative h-72 overflow-hidden bg-ink-graphite flex-shrink-0">
              <SmartImage
                local={localImg}
                fallback={fallbackImg}
                alt={artist.full_name}
                fill
                className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4">
                <span className={`font-body text-2xs tracking-widest uppercase px-3 py-1 ${
                  artist.is_accepting_clients ? 'bg-gold text-ink-black' : 'bg-ink-steel text-ink-ash'
                }`}>
                  {artist.is_accepting_clients ? 'Booking' : 'Waitlist'}
                </span>
              </div>
            </div>

            {/* Info — flex-col with flex-1 so the button always sits at the bottom */}
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-3">
                <h3 className="font-display text-2xl font-light text-ink-white">{artist.full_name}</h3>
                <p className="font-body text-xs text-ink-ash mt-1">{artist.years_experience} years experience · Lagos, NG</p>
              </div>

              <p className="font-body text-sm text-ink-silver leading-relaxed mb-4 flex-1 line-clamp-3">
                {artist.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {artist.specialty_names.slice(0, 3).map((s) => (
                  <span key={s}
                    className="font-body text-2xs tracking-widest uppercase text-gold border border-gold/30 px-2 py-1">
                    {s}
                  </span>
                ))}
              </div>

              {/* Button always at bottom, same line across all cards */}
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
        )
      })}
    </div>
  )
}
