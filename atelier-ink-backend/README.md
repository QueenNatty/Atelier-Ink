# Atelier Ink — Backend

Django REST API for Atelier Ink, a tattoo & piercing studio booking platform, plus a
custom **Studio Panel** for admins and artists to manage bookings, schedules, and
studio settings without touching the public-facing site.

---

## Stack

- **Django 5** + **Django REST Framework** — public/client-facing JSON API
- **SimpleJWT** — token auth for the client-facing frontend
- **Django sessions** — auth for the internal Studio Panel (separate from the API)
- **SQLite** by default (swap via `DATABASES` for Postgres in production)
- **Paystack** — payment integration (Naira)

## Project layout

```
inkbound/                  # project settings & root urls
apps/
  accounts/                # custom User model (role-based), JWT auth, login history
  studio/                  # Artist, Service, WorkingHours, Portfolio
  bookings/                # ConsultationSlot, SessionBlock, Booking
  payments/                # Paystack transactions
  staff/                   # ★ custom Studio Panel (session-based, server-rendered)
```

## Roles

Every `User` has a `role`: `admin`, `artist`, or `client`.

| Role   | Public API                       | Studio Panel (`/staff/`)                     |
|--------|-----------------------------------|-----------------------------------------------|
| client | books consultations & sessions   | no access                                      |
| artist | manages own slots/bookings via API | sees and manages **their own** bookings, slots |
| admin  | full API access                  | sees and manages **everything**, plus artists & services |

Client self-signup only ever creates `role=client` accounts (see
`apps/accounts/serializers.RegisterSerializer`). Admin and artist accounts are
created by staff — via `createsuperuser`, the `seed_dev_data` management command,
or directly in the Django admin at `/admin/`.

---

## Getting started

```bash
cd atelier-ink-backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env                                  # then fill in SECRET_KEY, Paystack keys, etc.

python manage.py migrate
python manage.py createsuperuser                      # or use the seed command below
python manage.py runserver
```

### Seed sample data (optional, dev only)

```bash
python manage.py seed_dev_data
```

This creates Nigerian sample artists, Naira-priced services, working hours, and
slots. It also creates an admin account:

- **Admin:** `admin@atelierink.ng` / `admin123`
- **Seeded artists:** password `atelierink123` (see command output for emails)

Change these before deploying anywhere real.

---

## The Studio Panel (`/staff/`)

A lightweight, server-rendered dashboard — separate from the public REST API —
for the people who actually run the studio.

Visit **`/staff/login/`** and sign in with an admin or artist account.

**What it does:**

- **Overview** — booking counts, today's consultations/sessions at a glance
- **Bookings** — filter/search, confirm, mark deposit paid, complete, mark no-show,
  cancel (with reason), leave private artist notes
- **Consultation slots** — add/cancel slots (artists see only their own; admins pick any artist)
- **Session blocks** — same, plus linked service and deposit amount
- **Artists** *(admin only)* — toggle whether an artist is accepting new clients
- **Services** *(admin only)* — add services, toggle active/inactive
- **Login history** — audit trail of login attempts (own history for artists, everyone's for admins)

**Design notes:**

- Auth is **session-based** (`django.contrib.auth`), completely separate from the
  JWT auth your client-facing frontend uses — logging into one doesn't log you
  into the other.
- Clients cannot log into `/staff/` even with valid credentials — the login form
  explicitly rejects non-staff roles.
- It reuses your existing models directly (no duplicate API layer), so data is
  always consistent with what the public API and frontend see.
- Templates and styles live entirely in `apps/staff/` — nothing in your other
  apps was changed except two lines: `apps.staff` added to `INSTALLED_APPS`, and
  `path("staff/", include("apps.staff.urls"))` added to `inkbound/urls.py`.

To promote someone to artist or admin, edit their `role` field via `/admin/` or
the Django shell:

```python
from apps.accounts.models import User
u = User.objects.get(email="someone@example.com")
u.role = User.Role.ARTIST   # or User.Role.ADMIN
u.save()
```

If you make someone an artist, remember to also create their `Artist` profile
(bio, specialties, working hours) — either via `/admin/` or the API — or the
Studio Panel will prompt them to ask an admin to set it up.

---

## API overview

All endpoints are under `/api/v1/`:

- `auth/` — register, login, logout, token refresh, `me`, change password, login history
- `studio/` — services, artists, working hours, portfolio
- `bookings/` — consultation slots, session blocks, bookings (+ `cancel`, `my_bookings`)
- `payments/` — Paystack transactions

Auth uses JWT bearer tokens (`Authorization: Bearer <access_token>`), obtained
from `POST /api/v1/auth/login/`.

## Environment variables

See `.env.example`. At minimum, set a real `SECRET_KEY` and Paystack test keys
before running anything beyond local dev.

## Deployment notes

- Set `DEBUG=False` and configure `ALLOWED_HOSTS` for production.
- Point `DATABASES` at Postgres (or similar) rather than SQLite.
- Run `python manage.py collectstatic` so the Studio Panel's CSS is served
  correctly outside of `DEBUG` mode.
- Use real Paystack live keys and update `PAYSTACK_CALLBACK_URL` to your
  deployed frontend's callback route.
