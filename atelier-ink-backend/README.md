# Inkbound Studio — Django Backend

REST API for the Inkbound Tattoo & Piercing Studio booking system.

## Tech Stack
- **Django 5** + **Django REST Framework**
- **SimpleJWT** for authentication
- **django-cors-headers** for Next.js integration
- **SQLite** (dev) / **PostgreSQL** (production)

---

## Quick Start

```bash
# 1. Create & activate virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file and edit values
cp .env.example .env

# 4. Run migrations
python manage.py migrate

# 5. Seed dev data (artists, services, slots, session blocks)
python manage.py seed_dev_data

# 6. Start the server
python manage.py runserver
```

API is now live at **http://localhost:8000/api/v1/**

---

## Dev Credentials (after seed_dev_data)

| Role   | Email                  | Password     |
|--------|------------------------|--------------|
| Admin  | admin@inkbound.com     | admin123     |
| Artist | maya@inkbound.com      | inkbound123  |
| Artist | kai@inkbound.com       | inkbound123  |

Django Admin: **http://localhost:8000/admin/**

---

## API Reference

### Auth  `/api/v1/auth/`
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `login/`              | JWT login → `{access, refresh, user}` |
| POST   | `register/`           | Client registration                |
| POST   | `logout/`             | Blacklist refresh token            |
| POST   | `token/refresh/`      | Refresh access token               |
| GET    | `me/`                 | Current user profile               |
| PATCH  | `me/`                 | Update profile                     |
| POST   | `change-password/`    | Change password                    |

### Studio  `/api/v1/studio/`
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `services/`           | List active services               |
| GET    | `artists/`            | List artists (public)              |
| GET    | `artists/{id}/`       | Artist detail + portfolio          |
| GET    | `working-hours/`      | Artist's own schedule              |
| POST   | `working-hours/`      | Set working hours (artist)         |
| GET    | `portfolio/`          | Portfolio images                   |
| POST   | `portfolio/`          | Upload portfolio image (artist)    |

### Bookings  `/api/v1/bookings/`
| Method | Endpoint                            | Description                         |
|--------|-------------------------------------|-------------------------------------|
| GET    | `consultation-slots/`               | Slots (filtered by role)            |
| GET    | `consultation-slots/available/`     | Available upcoming slots            |
| POST   | `consultation-slots/`               | Create slot (artist)                |
| GET    | `session-blocks/`                   | Session blocks                      |
| GET    | `session-blocks/available/`         | Open blocks with free hours         |
| POST   | `session-blocks/`                   | Create block (artist)               |
| GET    | `/`                                 | All bookings (scoped by role)       |
| POST   | `/`                                 | Create booking (client)             |
| GET    | `my-bookings/`                      | Current user's bookings             |
| PATCH  | `{id}/update-status/`               | Update status + notes (artist)      |
| POST   | `{id}/cancel/`                      | Cancel booking                      |

---

## Data Model Overview

```
User (custom AbstractBaseUser)
 └── Artist (1-to-1 profile)
      ├── WorkingHours (weekly schedule)
      ├── ArtistPortfolio (images)
      ├── ConsultationSlot (30-min free slots)
      └── SessionBlock (multi-hour blocks)
           └── Booking (client reservations)

Service (tattoo / piercing / consultation / touch-up / removal)
Booking → links Client + Artist + Service + Slot/Block
```

---

## Environment Variables

| Variable                        | Default      | Description                      |
|---------------------------------|--------------|----------------------------------|
| `SECRET_KEY`                    | —            | Django secret key                |
| `DEBUG`                         | `True`       | Debug mode                       |
| `CORS_ALLOWED_ORIGINS`          | —            | Comma-separated allowed origins  |
| `ACCESS_TOKEN_LIFETIME_MINUTES` | `60`         | JWT access token lifetime        |
| `REFRESH_TOKEN_LIFETIME_DAYS`   | `7`          | JWT refresh token lifetime       |

Production additionally requires: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `ALLOWED_HOSTS`
