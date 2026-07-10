/**
 * ATELIER INK — IMAGE CONFIGURATION
 * ===================================
 * To swap any image with your own photo:
 *
 * 1. Copy your image file into the matching folder inside /public/images/
 * 2. Replace the URL string below with your local path e.g. "/images/hero/studio.jpg"
 *
 * Folder guide:
 *   /public/images/hero/        → hero background, bottom CTA background
 *   /public/images/artists/     → artist profile photos (adaeze.jpg, emeka.jpg, zainab.jpg)
 *   /public/images/portfolio/   → portfolio/tattoo work photos (1.jpg … 8.jpg)
 */

// ── Hero ─────────────────────────────────────────────────────────────────────
export const HERO_BG =
  '/images/hero/studio-bg.jpg'                         // Replace with your studio/hero image
  || 'https://images.unsplash.com/photo-1618520042988-b8bb74e6d653?w=1600&q=80'

export const CTA_BG =
  '/images/hero/cta-bg.jpg'                            // Bottom CTA section background (optional)
  || 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1600&q=80'

// ── Artists ───────────────────────────────────────────────────────────────────
// When you add a new artist via the staff portal, add their image here.
// Key = first name in lowercase, value = path inside /public/images/artists/
// Example: if you add "Chidi Eze", add:  chidi: '/images/artists/chidi.jpg'
export const ARTIST_IMAGES: Record<string, string> = {
  adaeze: '/images/artists/adaeze.jpg',
  emeka:  '/images/artists/emeka.jpg',
  zainab: '/images/artists/zainab.jpg',
  // Add new artists below ↓
}

// Fallback Unsplash URLs used when local file doesn't exist yet
export const ARTIST_FALLBACKS: Record<string, string> = {
  adaeze: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
  emeka:  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
  zainab: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&q=80',
}

// ── Portfolio grid ────────────────────────────────────────────────────────────
export const PORTFOLIO_IMAGES = [
  {
    id: 1,
    local: '/images/portfolio/1.jpg',
    fallback: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
    alt: 'Fine line botanical arm piece',
    tag: 'Fine Line',
    featured: true,
  },
  {
    id: 2,
    local: '/images/portfolio/2.jpg',
    fallback: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800&q=80',
    alt: 'Blackwork geometric chest piece',
    tag: 'Blackwork',
    featured: false,
  },
  {
    id: 3,
    local: '/images/portfolio/3.jpg',
    fallback: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
    alt: 'Afrocentric pattern sleeve',
    tag: 'Afrocentric',
    featured: false,
  },
  {
    id: 4,
    local: '/images/portfolio/4.jpg',
    fallback: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80',
    alt: 'Neo-traditional shoulder piece',
    tag: 'Neo-Traditional',
    featured: true,
  },
  {
    id: 5,
    local: '/images/portfolio/5.jpg',
    fallback: 'https://images.unsplash.com/photo-1590246814883-57c511e68b1c?w=800&q=80',
    alt: 'Single needle minimalist wrist tattoo',
    tag: 'Single Needle',
    featured: false,
  },
  {
    id: 6,
    local: '/images/portfolio/6.jpg',
    fallback: 'https://images.unsplash.com/photo-1611091057873-e1a7bf78b63f?w=800&q=80',
    alt: 'Abstract geometric back piece',
    tag: 'Geometric',
    featured: false,
  },
  {
    id: 7,
    local: '/images/portfolio/7.jpg',
    fallback: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    alt: 'Ear constellation piercing',
    tag: 'Piercing',
    featured: false,
  },
  {
    id: 8,
    local: '/images/portfolio/8.jpg',
    fallback: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
    alt: 'Uli-inspired blackwork forearm',
    tag: 'Blackwork',
    featured: true,
  },
]

// ── Flash designs (booking wizard step 2) ────────────────────────────────────
export const FLASH_DESIGNS = [
  {
    id: 1,
    local: '/images/portfolio/flash-1.jpg',
    fallback: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=300&q=80',
    name: 'Uli Vine',
    style: 'Fine Line',
  },
  {
    id: 2,
    local: '/images/portfolio/flash-2.jpg',
    fallback: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=300&q=80',
    name: 'Adire Pattern',
    style: 'Blackwork',
  },
  {
    id: 3,
    local: '/images/portfolio/flash-3.jpg',
    fallback: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&q=80',
    name: 'Nsibidi Script',
    style: 'Geometric',
  },
  {
    id: 4,
    local: '/images/portfolio/flash-4.jpg',
    fallback: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=300&q=80',
    name: 'Lagos Bloom',
    style: 'Fine Line',
  },
  {
    id: 5,
    local: '/images/portfolio/flash-5.jpg',
    fallback: 'https://images.unsplash.com/photo-1590246814883-57c511e68b1c?w=300&q=80',
    name: 'Kente Sleeve',
    style: 'Traditional',
  },
  {
    id: 6,
    local: '/images/portfolio/flash-6.jpg',
    fallback: 'https://images.unsplash.com/photo-1611091057873-e1a7bf78b63f?w=300&q=80',
    name: 'Minimalist Ankh',
    style: 'Single Needle',
  },
]
