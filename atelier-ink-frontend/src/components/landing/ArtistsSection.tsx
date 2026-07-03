'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, ArrowRight, User } from 'lucide-react'
import { studioApi } from '@/lib/api'
import type { ArtistList } from '@/types'

// Nigerian artists — fallback when backend isn't connected
const FALLBACK_ARTISTS: ArtistList[] = [
  {
    id: 1,
    full_name: 'Adaeze Okonkwo',
    bio: 'Lagos-based fine line artist specialising in Afrocentric motifs, botanicals, and abstract geometry. 7 years of experience bringing intentional, lasting work to dark and light skin tones.',
    specialty_names: ['Fine Line', 'Afrocentric', 'Botanical'],
    avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
    is_accepting_clients: true,
    years_experience: 7,
  },
  {
    id: 2,
    full_name: 'Emeka Nwosu',
    bio: 'Neo-traditional and blackwork specialist. Draws heavy inspiration from Igbo uli patterns and Yoruba adire textile art. Each piece is a conversation between heritage and modern tattooing.',
    specialty_names: ['Blackwork', 'Neo-Traditional', 'Uli Patterns'],
    avatar_url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
    is_accepting_clients: true,
    years_experience: 9,
  },
  {
    id: 3,
    full_name: 'Zainab Bello',
    bio: 'Piercing specialist and minimalist tattoo artist from Abuja, now based in Lagos. Trained in London. Known for clean, precise piercings and delicate micro-scripts.',
    specialty_names: ['Piercing', 'Micro-Script', 'Minimalist'],
    avatar_url: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&q=80',
    is_accepting_clients: false,
    years_experience: 5,
  },
]

export default function ArtistsSection() {
  const [artists, setArtists] = useState<ArtistList[]>(FALLBACK_ARTISTS)

  useEffect(() => {
    studioApi.getArtists()
      .then((res) => { if (res.data.length > 0) setArtists(res.data) })
      .catch(() => {}) // silently use fallback
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map((artist) => (
        <div key={artist.id} className="card-ink group overflow-hidden">
          {/* Avatar */}
          <div className="relative h-80 overflow-hidden bg-ink-graphite">
            {artist.avatar_url ? (
              <Image
                src={artist.avatar_url}
                alt={artist.full_name}
                fill
                className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} className="text-ink-steel" />
              </div>
            )}
            {/* Availability badge */}
            <div className="absolute top-4 right-4">
              <span className={`font-body text-2xs tracking-widest uppercase px-3 py-1 ${
                artist.is_accepting_clients
                  ? 'bg-gold text-ink-black'
                  : 'bg-ink-steel text-ink-ash'
              }`}>
                {artist.is_accepting_clients ? 'Booking' : 'Waitlist'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-2xl font-light text-ink-white">
                  {artist.full_name}
                </h3>
                <p className="font-body text-xs text-ink-ash mt-1 tracking-wide">
                  {artist.years_experience} years experience
                </p>
              </div>
            </div>

            <p className="font-body text-sm text-ink-silver leading-relaxed mb-4 line-clamp-3">
              {artist.bio}
            </p>

            {/* Specialty tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {artist.specialty_names.slice(0, 3).map((s) => (
                <span key={s} className="font-body text-2xs tracking-widest uppercase text-gold border border-gold/30 px-2 py-1">
                  {s}
                </span>
              ))}
            </div>

            {artist.is_accepting_clients && (
              <Link
                href={`/book?artist=${artist.id}`}
                className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors group/link"
              >
                Book with {artist.full_name.split(' ')[0]}
                <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
