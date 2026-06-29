# Atelier Ink — Next.js Frontend

Sleek, modern booking interface for the Atelier Ink tattoo & piercing studio.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom design tokens
- **Zustand** for wizard state management
- **Axios** for API communication
- **react-dropzone** for file uploads
- **date-fns** for date formatting
- **Cormorant Garamond** (display) + **Inter** (body) typefaces

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create env file
cp .env.local.example .env.local

# 3. Start dev server (make sure Django backend is running first)
npm run dev
```

Frontend runs at **http://localhost:3000**
Django backend must be running at **http://localhost:8000**

---

## Pages

| Route   | Description                          |
|---------|--------------------------------------|
| `/`     | Studio landing page                  |
| `/book` | 5-step booking wizard                |

---

## Design System

### Colors
| Token            | Hex       | Usage                    |
|------------------|-----------|--------------------------|
| `ink-black`      | `#0A0A0A` | Page background          |
| `ink-charcoal`   | `#141414` | Card backgrounds         |
| `ink-graphite`   | `#1E1E1E` | Input backgrounds        |
| `ink-steel`      | `#2A2A2A` | Borders                  |
| `ink-silver`     | `#9A9A9A` | Body text                |
| `ink-white`      | `#F5F5F0` | Headings                 |
| `gold`           | `#C9A84C` | Accents, CTAs            |

### Typography
- **Display**: Cormorant Garamond — used for headings, logotype
- **Body**: Inter — used for all UI text, labels, buttons

---

## Booking Wizard Flow

```
Step 1: Artist & Service Selection
  → Pick specific artist or "Any Artist"
  → Choose Tattoo or Piercing
  → If Piercing: pick placement

Step 2: Creative Brief (Tattoo only)
  → Flash: select from gallery
  → Custom: placement + dimensions + reference image upload

Step 3: Schedule
  → Calendar showing available dates (from backend)
  → Consultation slots (30 min, free)
  → Session blocks (multi-hour, deposit required)

Step 4: Health & Legal
  → Age verification checkbox
  → Health screening checklist
  → Deposit policy acknowledgement
  → Next button disabled until all checked

Step 5: Checkout
  → Booking summary card
  → Stripe payment UI (mockup)
  → POST to Django API on confirm

Confirmation: Success screen with calendar link
```

---

## Connecting to Backend

The API client in `src/lib/api.ts` connects to your Django backend.

Make sure your `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The app gracefully falls back to sample data if the backend is unreachable, so the UI always renders even in development.

---

## Deployment

```bash
npm run build
npm start
```

For Vercel: connect your GitHub repo, set `NEXT_PUBLIC_API_URL` to your Railway backend URL, and deploy.
