'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react'
import { FLASH_DESIGNS } from '@/lib/images'
import SmartImage from '@/components/ui/SmartImage'
import { useWizardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// Flash designs - in production these come from the backend
const FLASH_DESIGNS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=300&q=80', name: 'Uli Vine', style: 'Fine Line' },
  { id: 2, url: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=300&q=80', name: 'Adire Pattern', style: 'Neo-Traditional' },
  { id: 3, url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&q=80', name: 'Nsibidi Script', style: 'Blackwork' },
  { id: 4, url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=300&q=80', name: 'Lagos Bloom', style: 'Fine Line' },
  { id: 5, url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=300&q=80', name: 'Kente Sleeve', style: 'Traditional' },
  { id: 6, url: 'https://images.unsplash.com/photo-1611091057873-e1a7bf78b63f?w=300&q=80', name: 'Minimalist Ankh', style: 'Single Needle' },
]

export default function Step2Creative() {
  const {
    serviceType, tattooPath, flashDesignId,
    customPlacement, customDimensions, referenceFile,
    setTattooPath, setFlashDesign,
    setCustomPlacement, setCustomDimensions, setReferenceFile,
    nextStep, prevStep,
  } = useWizardStore()

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setReferenceFile(files[0])
  }, [setReferenceFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  // Piercing - no step 2 needed, skip forward
  if (serviceType === 'piercing') {
    return (
      <div className="text-center py-12">
        <p className="section-label mb-3">Step 2</p>
        <h2 className="display-heading text-4xl text-ink-white mb-4">You're All Set</h2>
        <p className="font-body text-ink-silver mb-10">
          Piercing bookings don't require a creative brief. Let's pick your date.
        </p>
        <div className="flex justify-between">
          <button onClick={prevStep} className="btn-ghost">Back</button>
          <button onClick={nextStep} className="btn-primary">Continue</button>
        </div>
      </div>
    )
  }

  const canProceed =
    (tattooPath === 'flash' && flashDesignId !== null) ||
    (tattooPath === 'custom' && customPlacement.length > 0)

  return (
    <div>
      <p className="section-label mb-3">Step 2</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Your Design</h2>
      <p className="font-body text-ink-silver mb-10">
        Choose a flash design from our catalogue or describe your custom concept.
      </p>

      {/* Path toggle */}
      <div className="flex gap-3 mb-10">
        {(['flash', 'custom'] as const).map((path) => (
          <button
            key={path}
            onClick={() => setTattooPath(path)}
            className={cn(
              'flex-1 py-4 border font-body text-sm tracking-widest uppercase transition-all duration-200',
              tattooPath === path
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-ink-steel text-ink-silver hover:border-ink-smoke'
            )}
          >
            {path === 'flash' ? '⚡ Flash Design' : '✏️ Custom Piece'}
          </button>
        ))}
      </div>

      {/* Flash gallery */}
      {tattooPath === 'flash' && (
        <div className="animate-fade-in">
          <p className="font-body text-xs text-ink-ash tracking-widest uppercase mb-4">
            Select a design
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FLASH_DESIGNS.map((design) => (
              <button
                key={design.id}
                onClick={() => setFlashDesign(design.id)}
                className={cn(
                  'relative group overflow-hidden aspect-square border transition-all duration-200',
                  flashDesignId === design.id
                    ? 'border-gold'
                    : 'border-ink-steel hover:border-ink-smoke'
                )}
              >
                <SmartImage
                  local={design.local}
                  fallback={design.fallback}
                  alt={design.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-display text-sm text-ink-white">{design.name}</p>
                  <p className="font-body text-2xs text-gold">{design.style}</p>
                </div>
                {flashDesignId === design.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gold flex items-center justify-center">
                    <Check size={12} className="text-ink-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom form */}
      {tattooPath === 'custom' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
              Placement *
            </label>
            <input
              type="text"
              placeholder="e.g. Inner forearm, left side"
              value={customPlacement}
              onChange={(e) => setCustomPlacement(e.target.value)}
              className="input-ink"
            />
          </div>

          <div>
            <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
              Approximate size
            </label>
            <input
              type="text"
              placeholder="e.g. 3in x 2in or fist-sized"
              value={customDimensions}
              onChange={(e) => setCustomDimensions(e.target.value)}
              className="input-ink"
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="font-body text-xs text-ink-silver tracking-widest uppercase block mb-2">
              Reference image (optional)
            </label>
            {referenceFile ? (
              <div className="relative border border-gold bg-gold/5 p-4 flex items-center gap-4">
                <ImageIcon size={20} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-ink-white truncate">{referenceFile.name}</p>
                  <p className="font-body text-xs text-ink-ash">
                    {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setReferenceFile(null)}
                  className="text-ink-ash hover:text-gold transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200',
                  isDragActive
                    ? 'border-gold bg-gold/5'
                    : 'border-ink-steel hover:border-ink-smoke'
                )}
              >
                <input {...getInputProps()} />
                <Upload size={24} className="text-ink-ash mx-auto mb-3" />
                <p className="font-body text-sm text-ink-silver">
                  {isDragActive ? 'Drop it here' : 'Drag & drop or click to upload'}
                </p>
                <p className="font-body text-xs text-ink-ash mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-between">
        <button onClick={prevStep} className="btn-ghost">Back</button>
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
