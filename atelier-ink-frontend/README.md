# Atelier Ink — Tattoo & Piercing Studio Booking System

> A full-stack web application built as a backend engineering course project for **SEN 310** at the **Federal University of Technology, Owerri (FUTO)**, Nigeria.

---

## What is this?

Atelier Ink is a booking platform for a fictional tattoo and piercing studio based in **Surulere, Lagos State**. It handles everything from client-facing booking flows to internal staff management — all tailored for a Nigerian context, with Paystack payment integration and Naira pricing throughout.

The project was built to demonstrate real-world backend engineering concepts: custom authentication, role-based access control, REST API design, payment gateway integration, and session/audit logging.

---

## The Stack

**Backend — Django**
- Django 5 + Django REST Framework
- JWT authentication via SimpleJWT (with token blacklisting on logout)
- Custom User model with three roles: client, artist, admin
- Login history tracking — every attempt recorded with IP and timestamp
- Paystack payment integration for deposit collection in Naira
- SQLite in development, PostgreSQL-ready for production
- Separate staff portal (server-rendered Django views) for artists and admins

**Frontend — Next.js**
- Next.js 14 with the App Router
- TypeScript throughout
- Tailwind CSS with a custom dark design system
- Zustand for booking wizard state management
- Axios with automatic JWT refresh

---

## Project Structure

```
atelier-ink/
├── atelier-ink-backend/
│   ├── apps/
│   │   ├── accounts/     — Custom user model, JWT auth, login history
│   │   ├── studio/       — Artists, services, working hours
│   │   ├── bookings/     — Consultation slots, session blocks, bookings
│   │   ├── payments/     — Paystack integration, transaction records
│   │   └── staff/        — Server-rendered admin/artist portal
│   └── manage.py
│
└── atelier-ink-frontend/
    ├── src/
    │   ├── app/           — Pages (home, book, login, register, callback)
    │   ├── components/    — Booking wizard, landing sections, UI
    │   └── lib/           — API client, auth context, Zustand store
    └── public/images/     — Drop your own photos here
```

---

## Running Locally

### Backend
```bash
cd atelier-ink-backend
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter python-decouple requests
copy .env.example .env
python manage.py makemigrations accounts studio bookings payments
python manage.py migrate
python manage.py seed_dev_data
python manage.py runserver
```

### Frontend
```bash
cd atelier-ink-frontend
npm install
copy .env.local.example .env.local
npm run dev
```

---

## Test Accounts

| Role   | Email                  | Password      | Access                       |
|--------|------------------------|---------------|------------------------------|
| Admin  | admin@atelierink.ng    | admin123      | localhost:8000/staff/        |
| Artist | adaeze@atelierink.ng   | atelierink123 | localhost:8000/staff/        |
| Artist | emeka@atelierink.ng    | atelierink123 | localhost:8000/staff/        |
| Client | register at /register  | your choice   | localhost:3000               |

---

## Paystack Test Card

```
Card:   4084 0840 8408 4081
Expiry: Any future date
CVV:    408
PIN:    0000
```
No real money moves in test mode.

---

## API Reference

```
POST  /api/v1/auth/login/
POST  /api/v1/auth/register/
GET   /api/v1/auth/me/
GET   /api/v1/auth/login-history/

GET   /api/v1/studio/artists/
GET   /api/v1/studio/services/

GET   /api/v1/bookings/consultation-slots/available/
GET   /api/v1/bookings/session-blocks/available/
POST  /api/v1/bookings/
GET   /api/v1/bookings/my-bookings/

POST  /api/v1/payments/initiate/
POST  /api/v1/payments/verify/
POST  /api/v1/payments/webhook/
```

---

## Course Context

**Course:** SEN 310 — Backend Development  
**Institution:** Federal University of Technology, Owerri (FUTO)  
**Purpose:** Demonstrate practical backend engineering — API design, authentication, payment integration, role-based access control, and full-stack integration.

---

*Built in 2025–2026.*
