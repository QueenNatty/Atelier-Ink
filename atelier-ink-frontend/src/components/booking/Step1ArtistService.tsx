'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { User, Sparkles } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { studioApi } from '@/lib/api'
import type { ArtistList, PiercingPlacement } from '@/types'
import { cn } from '@/lib/utils'
import { ARTIST_IMAGES, ARTIST_FALLBACKS } from '@/lib/images'
import SmartImage from '@/components/ui/SmartImage'

const FALLBACK_ARTISTS: ArtistList[] = [
  {
    id: 1, full_name: 'Adaeze Okonkwo',
    bio: 'Fine line & Afrocentric botanical work. Lagos-based.',
    specialty_names: ['Fine Line', 'Botanical'],
    avatar_url: null, is_accepting_clients: true, years_experience: 7,
  },
  {
    id: 2, full_name: 'Emeka Nwosu',
    bio: 'Igbo uli-inspired blackwork & neo-traditional.',
    specialty_names: ['Blackwork', 'Neo-Traditional'],
    avatar_url: null, is_accepting_clients: true, years_experience: 9,
  },
  {
    id: 3, full_name: 'Zainab Bello',
    bio: 'Piercing specialist & minimalist tattoo artist.',
    specialty_names: ['Piercing', 'Minimalist'],
    avatar_url: null, is_accepting_clients: true, years_experience: 5,
  },
]

const PIERCING_PLACEMENTS: { value: PiercingPlacement; label: string }[] = [
  { value: 'lobe', label: 'Lobe' },
  { value: 'helix', label: 'Helix' },
  { value: 'tragus', label: 'Tragus' },
  { value: 'daith', label: 'Daith' },
  { value: 'conch', label: 'Conch' },
  { value: 'septum', label: 'Septum' },
  { value: 'nostril', label: 'Nostril' },
  { value: 'eyebrow', label: 'Eyebrow' },
  { value: 'navel', label: 'Navel' },
  { value: 'other', label: 'Other' },
]

// Map artist full names to local image keys
const ARTIST_KEY: Record<string, string> = {
  'Adaeze Okonkwo': 'adaeze',
  'Emeka Nwosu': 'emeka',
  'Zainab Bello': 'zainab',
}

function ArtistAvatar({ artist }: { artist: ArtistList }) {
  // Check known artists by full name, then try first name lowercase as fallback key
  const key = ARTIST_KEY[artist.full_name]
    || artist.full_name.split(' ')[0].toLowerCase()
  const localImg = ARTIST_IMAGES[key] || ''
  const fallbackImg = artist.avatar_url || ARTIST_FALLBACKS[key] || ''

  if (localImg || fallbackImg) {
    return (
      <SmartImage
        local={localImg || fallbackImg}
        fallback={fallbackImg || localImg}
        alt={artist.full_name}
        width={56}
        height={56}
        className="w-full h-full object-cover grayscale"
      />
    )
  }

  // New artist with no photo yet — show initials
  const initials = artist.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-full h-full bg-ink-steel flex items-center justify-center">
      <span className="font-display text-lg text-ink-mist">{initials}</span>
    </div>
  )
}

export default function Step1ArtistService() {
  const {
    selectedArtist, anyArtist, serviceType, piercingPlacement,
    setArtist, setAnyArtist, setServiceType, setPiercingPlacement, nextStep
  } = useWizardStore()

  const [artists, setArtists] = useState<ArtistList[]>(FALLBACK_ARTISTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studioApi.getArtists()
      .then((res) => {
        setArtists(res.data.length > 0 ? res.data : FALLBACK_ARTISTS)
      })
      .catch(() => {
        setArtists(FALLBACK_ARTISTS)
      })
      .finally(() => setLoading(false))
  }, [])

  const artistSelected = selectedArtist !== null || anyArtist
  const canProceed = artistSelected && serviceType !== null &&
    (serviceType === 'tattoo' || (serviceType === 'piercing' && piercingPlacement !== null))

  return (
    <div>
      <p className="section-label mb-3">Step 1</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Choose Your Artist</h2>
      <p className="font-body text-ink-silver mb-10">
        Select a specific artist or let us match you with the first available.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Any artist card */}
        <button
          onClick={() => setAnyArtist(true)}
          className={cn(
            'relative text-left p-5 border transition-all duration-200 flex items-center gap-4',
            anyArtist ? 'border-gold bg-gold/10' : 'border-ink-steel bg-ink-charcoal hover:border-ink-smoke'
          )}
        >
          <div className="w-14 h-14 bg-ink-steel flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className={anyArtist ? 'text-gold' : 'text-ink-ash'} />
          </div>
          <div>
            <p className="font-display text-lg text-ink-white">Any Artist</p>
            <p className="font-body text-xs text-ink-silver mt-1">First available slot</p>
          </div>
          {anyArtist && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-gold flex items-center justify-center">
              <div className="w-2 h-2 bg-ink-black rounded-full" />
            </div>
          )}
        </button>

        {/* Artist cards — all artists from backend, waitlisted ones greyed out */}
        {artists.map((artist) => (
          <button
            key={artist.id}
            onClick={() => artist.is_accepting_clients && setArtist(artist)}
            disabled={!artist.is_accepting_clients}
            className={cn(
              'relative text-left p-5 border transition-all duration-200 flex items-center gap-4',
              !artist.is_accepting_clients
                ? 'border-ink-steel bg-ink-graphite opacity-50 cursor-not-allowed'
                : selectedArtist?.id === artist.id
                ? 'border-gold bg-gold/10'
                : 'border-ink-steel bg-ink-charcoal hover:border-ink-smoke'
            )}
          >
            <div className="w-14 h-14 overflow-hidden flex-shrink-0 bg-ink-steel">
              <ArtistAvatar artist={artist} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg text-ink-white">{artist.full_name}</p>
              <p className="font-body text-xs text-ink-silver mt-0.5 truncate">
                {artist.specialty_names.join(' · ')}
              </p>
              {!artist.is_accepting_clients && (
                <p className="font-body text-2xs text-ink-ash tracking-widest uppercase mt-1">
                  On waitlist
                </p>
              )}
            </div>
            {selectedArtist?.id === artist.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-gold flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-ink-black rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Service type toggle */}
      {artistSelected && (
        <div className="mt-10 animate-fade-in">
          <p className="font-body text-xs text-ink-silver mb-4 tracking-widest uppercase">
            What type of service?
          </p>
          <div className="flex gap-3">
            {(['tattoo', 'piercing'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                className={cn(
                  'flex-1 py-4 border font-body text-sm tracking-widest uppercase transition-all duration-200',
                  serviceType === type
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-ink-steel text-ink-silver hover:border-ink-smoke'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Piercing placement */}
      {serviceType === 'piercing' && (
        <div className="mt-8 animate-fade-in">
          <p className="font-body text-xs text-ink-silver mb-4 tracking-widest uppercase">
            Placement
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PIERCING_PLACEMENTS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPiercingPlacement(value)}
                className={cn(
                  'py-3 border font-body text-sm transition-all duration-200',
                  piercingPlacement === value
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-ink-steel text-ink-silver hover:border-ink-smoke'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={cn('btn-primary', !canProceed && 'opacity-40 cursor-not-allowed hover:scale-100')}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
