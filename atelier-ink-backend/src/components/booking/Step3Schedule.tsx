'use client'

import { useEffect, useState } from 'react'
import { format, addDays, isSameDay, isToday, isPast } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { useWizardStore } from '@/lib/store'
import { bookingApi } from '@/lib/api'
import type { ConsultationSlot, SessionBlock } from '@/types'
import { cn, formatTime } from '@/lib/utils'

export default function Step3Schedule() {
  const {
    selectedArtist, serviceType, setSlot, setBlock, setDate,
    selectedSlot, selectedBlock, selectedDate, nextStep, prevStep
  } = useWizardStore()

  const [slots, setSlots] = useState<ConsultationSlot[]>([])
  const [blocks, setBlocks] = useState<SessionBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [calDate, setCalDate] = useState(new Date())

  useEffect(() => {
    const artistId = selectedArtist?.id
    setLoading(true)

    const fetches = [
      bookingApi.getAvailableSlots(artistId),
      bookingApi.getAvailableBlocks(artistId),
    ]

    Promise.allSettled(fetches).then(([slotsRes, blocksRes]) => {
      if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value.data)
      if (blocksRes.status === 'fulfilled') setBlocks(blocksRes.value.data)
      setLoading(false)
    })
  }, [selectedArtist])

  // Get all available dates
  const allDates = [
    ...slots.map(s => s.date),
    ...blocks.map(b => b.date),
  ]
  const availableDates = [...new Set(allDates)]

  // Generate calendar days (next 30 days)
  const calDays = Array.from({ length: 35 }, (_, i) => {
    const d = addDays(new Date(), i - new Date().getDay())
    return d
  })

  const slotsForDate = (date: string) => slots.filter(s => s.date === date)
  const blocksForDate = (date: string) => blocks.filter(b => b.date === date)

  const hasSlots = selectedDate && (
    slotsForDate(selectedDate).length > 0 ||
    blocksForDate(selectedDate).length > 0
  )

  const canProceed = selectedSlot !== null || selectedBlock !== null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="font-body text-sm text-ink-silver">Loading availability...</p>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-3">Step 3</p>
      <h2 className="display-heading text-4xl text-ink-white mb-2">Pick a Date</h2>
      <p className="font-body text-ink-silver mb-10">
        Select an available date then choose your time slot.
      </p>

      {/* Calendar */}
      <div className="bg-ink-charcoal border border-ink-steel p-6 mb-8">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCalDate(d => addDays(d, -7))}
            className="text-ink-silver hover:text-gold transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-display text-xl text-ink-white">
            {format(calDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCalDate(d => addDays(d, 7))}
            className="text-ink-silver hover:text-gold transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center font-body text-2xs text-ink-ash tracking-widest uppercase py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isAvailable = availableDates.includes(dateStr)
            const isPastDay = isPast(day) && !isToday(day)
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={i}
                disabled={!isAvailable || isPastDay}
                onClick={() => {
                  setDate(dateStr)
                }}
                className={cn(
                  'aspect-square flex items-center justify-center font-body text-sm transition-all duration-200 relative',
                  isSelected
                    ? 'bg-gold text-ink-black font-medium'
                    : isAvailable && !isPastDay
                    ? 'hover:bg-ink-steel text-ink-white cursor-pointer'
                    : isPastDay
                    ? 'text-ink-smoke cursor-not-allowed'
                    : 'text-ink-smoke cursor-not-allowed',
                  isToday(day) && !isSelected && 'text-gold'
                )}
              >
                {format(day, 'd')}
                {isAvailable && !isPastDay && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="animate-fade-in">
          <p className="font-body text-xs text-ink-ash tracking-widest uppercase mb-4">
            Available times — {format(new Date(selectedDate + 'T00:00'), 'EEEE, MMMM d')}
          </p>

          {!hasSlots && (
            <p className="font-body text-sm text-ink-silver py-6 text-center border border-ink-steel">
              No availability on this date. Please select another.
            </p>
          )}

          {/* Consultation slots */}
          {slotsForDate(selectedDate).length > 0 && (
            <div className="mb-6">
              <p className="font-body text-2xs tracking-widest uppercase text-gold mb-3">
                Consultations (30 min · Free)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slotsForDate(selectedDate).map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSlot(slot)}
                    className={cn(
                      'py-3 px-4 border font-body text-sm flex items-center gap-2 transition-all duration-200',
                      selectedSlot?.id === slot.id
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-ink-steel text-ink-silver hover:border-ink-smoke'
                    )}
                  >
                    <Clock size={14} />
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session blocks */}
          {blocksForDate(selectedDate).length > 0 && (
            <div>
              <p className="font-body text-2xs tracking-widest uppercase text-gold mb-3">
                Sessions (Multi-hour)
              </p>
              <div className="space-y-2">
                {blocksForDate(selectedDate).map((block) => (
                  <button
                    key={block.id}
                    onClick={() => setBlock(block)}
                    className={cn(
                      'w-full py-4 px-5 border text-left transition-all duration-200 flex items-center justify-between',
                      selectedBlock?.id === block.id
                        ? 'border-gold bg-gold/10'
                        : 'border-ink-steel hover:border-ink-smoke'
                    )}
                  >
                    <div>
                      <p className="font-body text-sm text-ink-white">
                        {formatTime(block.start_time)} – {formatTime(block.end_time)}
                      </p>
                      <p className="font-body text-xs text-ink-silver mt-1">
                        {block.available_hours}h available · ₦${block.deposit_required} deposit (₦)
                      </p>
                    </div>
                    <span className={cn(
                      'font-body text-xs tracking-widest uppercase px-2 py-1',
                      selectedBlock?.id === block.id ? 'text-gold' : 'text-ink-ash'
                    )}>
                      {block.artist_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
