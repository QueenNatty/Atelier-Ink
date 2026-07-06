// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  role: 'admin' | 'artist' | 'client'
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
  user: User
}

// ── Studio ────────────────────────────────────────────────────────────────────
export type ServiceCategory = 'tattoo' | 'piercing' | 'consultation' | 'touch_up' | 'removal'

export interface Service {
  id: number
  name: string
  category: ServiceCategory
  category_display: string
  description: string
  base_price: string
  min_duration_minutes: number
  max_duration_minutes: number | null
  is_active: boolean
}

export interface WorkingHours {
  id: number
  day_of_week: number
  day_name: string
  start_time: string
  end_time: string
  is_available: boolean
}

export interface PortfolioImage {
  id: number
  image_url: string | null
  caption: string
  service: number | null
  is_featured: boolean
  uploaded_at: string
}

export interface Artist {
  id: number
  user: User
  bio: string
  specialties: Service[]
  instagram_handle: string
  avatar_url: string | null
  is_accepting_clients: boolean
  years_experience: number
  working_hours: WorkingHours[]
  portfolio_images: PortfolioImage[]
}

export interface ArtistList {
  id: number
  full_name: string
  bio: string
  specialty_names: string[]
  avatar_url: string | null
  is_accepting_clients: boolean
  years_experience: number
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export type SlotStatus = 'available' | 'booked' | 'cancelled' | 'completed'
export type BlockStatus = 'open' | 'full' | 'cancelled' | 'completed'
export type BookingType = 'consultation' | 'session'
export type BookingStatus = 'pending' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled' | 'no_show'

export interface ConsultationSlot {
  id: number
  artist: number
  artist_name: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: SlotStatus
  is_upcoming: boolean
}

export interface SessionBlock {
  id: number
  artist: number
  artist_name: string
  service: number | null
  service_detail: Service | null
  date: string
  start_time: string
  end_time: string
  total_hours: number
  available_hours: number
  booked_hours: string
  status: BlockStatus
  deposit_required: string
}

export interface Booking {
  id: number
  client: number
  client_name: string
  artist: number
  artist_name: string
  service: number | null
  service_detail: Service | null
  booking_type: BookingType
  status: BookingStatus
  consultation_slot: number | null
  session_block: number | null
  session_date: string | null
  session_start_time: string | null
  session_hours: string | null
  description: string
  placement: string
  quoted_price: string | null
  deposit_amount: string
  deposit_paid: boolean
  created_at: string
}

// ── Booking Wizard State ──────────────────────────────────────────────────────
export type PiercingPlacement =
  | 'lobe' | 'helix' | 'tragus' | 'daith' | 'conch'
  | 'septum' | 'nostril' | 'eyebrow' | 'navel' | 'other'

export type TattooPath = 'flash' | 'custom'

export interface WizardState {
  step: number
  // Step 1
  selectedArtist: ArtistList | null
  anyArtist: boolean
  serviceType: 'tattoo' | 'piercing' | null
  selectedService: Service | null
  piercingPlacement: PiercingPlacement | null
  // Step 2
  tattooPath: TattooPath | null
  flashDesignId: number | null
  customPlacement: string
  customDimensions: string
  referenceFile: File | null
  // Step 3
  selectedSlot: ConsultationSlot | null
  selectedBlock: SessionBlock | null
  selectedDate: string | null
  // Step 4
  ageConfirmed: boolean
  healthConfirmed: boolean
  depositConfirmed: boolean
  // Step 5
  bookingResult: Booking | null
}

export type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_ARTIST'; payload: ArtistList | null }
  | { type: 'SET_ANY_ARTIST'; payload: boolean }
  | { type: 'SET_SERVICE_TYPE'; payload: 'tattoo' | 'piercing' }
  | { type: 'SET_SERVICE'; payload: Service | null }
  | { type: 'SET_PIERCING_PLACEMENT'; payload: PiercingPlacement }
  | { type: 'SET_TATTOO_PATH'; payload: TattooPath }
  | { type: 'SET_FLASH_DESIGN'; payload: number }
  | { type: 'SET_CUSTOM_PLACEMENT'; payload: string }
  | { type: 'SET_CUSTOM_DIMENSIONS'; payload: string }
  | { type: 'SET_REFERENCE_FILE'; payload: File | null }
  | { type: 'SET_SLOT'; payload: ConsultationSlot }
  | { type: 'SET_BLOCK'; payload: SessionBlock }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_AGE_CONFIRMED'; payload: boolean }
  | { type: 'SET_HEALTH_CONFIRMED'; payload: boolean }
  | { type: 'SET_DEPOSIT_CONFIRMED'; payload: boolean }
  | { type: 'SET_BOOKING_RESULT'; payload: Booking }
  | { type: 'RESET' }
