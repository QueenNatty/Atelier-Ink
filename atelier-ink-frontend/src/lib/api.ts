import axios from 'axios'
import type {
  AuthTokens, User, Artist, ArtistList,
  Service, ConsultationSlot, SessionBlock, Booking,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token management ──────────────────────────────────────────────────────────
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('access_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export const initAuth = () => {
  const token = localStorage.getItem('access_token')
  if (token) setAuthToken(token)
}

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/api/v1/auth/token/refresh/`, { refresh })
          setAuthToken(data.access)
          original.headers['Authorization'] = `Bearer ${data.access}`
          return api(original)
        } catch {
          setAuthToken(null)
        }
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login/', { email, password }),

  register: (data: { email: string; first_name: string; last_name: string; phone?: string; password: string; password_confirm: string }) =>
    api.post<AuthTokens>('/auth/register/', data),

  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }),

  me: () => api.get<User>('/auth/me/'),
}

// ── Studio endpoints ──────────────────────────────────────────────────────────
export const studioApi = {
  getArtists: () =>
    api.get<ArtistList[]>('/studio/artists/', {
      params: { _t: Date.now() },  // cache-bust so availability changes reflect immediately
      headers: { 'Cache-Control': 'no-cache' },
    }),

  getArtist: (id: number) =>
    api.get<Artist>(`/studio/artists/${id}/`),

  getServices: (category?: string) =>
    api.get<Service[]>('/studio/services/', { params: category ? { category } : {} }),
}

// ── Booking endpoints ─────────────────────────────────────────────────────────
export const bookingApi = {
  getAvailableSlots: (artistId?: number) =>
    api.get<ConsultationSlot[]>('/bookings/consultation-slots/available/', {
      params: artistId ? { artist: artistId } : {},
    }),

  getAvailableBlocks: (artistId?: number, serviceId?: number) =>
    api.get<SessionBlock[]>('/bookings/session-blocks/available/', {
      params: { ...(artistId && { artist: artistId }), ...(serviceId && { service: serviceId }) },
    }),

  createBooking: (data: {
    artist: number
    service?: number
    booking_type: 'consultation' | 'session'
    consultation_slot?: number
    session_block?: number
    session_hours?: number
    description?: string
    placement?: string
  }) => api.post<Booking>('/bookings/', data),

  myBookings: () =>
    api.get<Booking[]>('/bookings/my-bookings/'),

  cancelBooking: (id: number, reason?: string) =>
    api.post<Booking>(`/bookings/${id}/cancel/`, { reason }),
}
