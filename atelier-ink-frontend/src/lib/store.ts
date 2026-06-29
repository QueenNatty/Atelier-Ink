import { create } from 'zustand'
import type { WizardState, ArtistList, Service, ConsultationSlot, SessionBlock, Booking, PiercingPlacement, TattooPath } from '@/types'

interface WizardStore extends WizardState {
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setArtist: (artist: ArtistList | null) => void
  setAnyArtist: (val: boolean) => void
  setServiceType: (type: 'tattoo' | 'piercing') => void
  setService: (service: Service | null) => void
  setPiercingPlacement: (p: PiercingPlacement) => void
  setTattooPath: (path: TattooPath) => void
  setFlashDesign: (id: number) => void
  setCustomPlacement: (val: string) => void
  setCustomDimensions: (val: string) => void
  setReferenceFile: (file: File | null) => void
  setSlot: (slot: ConsultationSlot) => void
  setBlock: (block: SessionBlock) => void
  setDate: (date: string) => void
  setAgeConfirmed: (val: boolean) => void
  setHealthConfirmed: (val: boolean) => void
  setDepositConfirmed: (val: boolean) => void
  setBookingResult: (booking: Booking) => void
  reset: () => void
}

const initialState: WizardState = {
  step: 1,
  selectedArtist: null,
  anyArtist: false,
  serviceType: null,
  selectedService: null,
  piercingPlacement: null,
  tattooPath: null,
  flashDesignId: null,
  customPlacement: '',
  customDimensions: '',
  referenceFile: null,
  selectedSlot: null,
  selectedBlock: null,
  selectedDate: null,
  ageConfirmed: false,
  healthConfirmed: false,
  depositConfirmed: false,
  bookingResult: null,
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  setArtist: (artist) => set({ selectedArtist: artist, anyArtist: false }),
  setAnyArtist: (val) => set({ anyArtist: val, selectedArtist: null }),
  setServiceType: (type) => set({ serviceType: type, selectedService: null, piercingPlacement: null, tattooPath: null }),
  setService: (service) => set({ selectedService: service }),
  setPiercingPlacement: (p) => set({ piercingPlacement: p }),
  setTattooPath: (path) => set({ tattooPath: path, flashDesignId: null }),
  setFlashDesign: (id) => set({ flashDesignId: id }),
  setCustomPlacement: (val) => set({ customPlacement: val }),
  setCustomDimensions: (val) => set({ customDimensions: val }),
  setReferenceFile: (file) => set({ referenceFile: file }),
  setSlot: (slot) => set({ selectedSlot: slot, selectedBlock: null }),
  setBlock: (block) => set({ selectedBlock: block, selectedSlot: null }),
  setDate: (date) => set({ selectedDate: date }),
  setAgeConfirmed: (val) => set({ ageConfirmed: val }),
  setHealthConfirmed: (val) => set({ healthConfirmed: val }),
  setDepositConfirmed: (val) => set({ depositConfirmed: val }),
  setBookingResult: (booking) => set({ bookingResult: booking }),
  reset: () => set(initialState),
}))
