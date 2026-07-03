"""
Usage: python manage.py seed_dev_data
Seeds Nigerian artists, Naira-priced services, slots and session blocks.
"""
import random
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.studio.models import Artist, Service, WorkingHours
from apps.bookings.models import ConsultationSlot, SessionBlock


class Command(BaseCommand):
    help = "Seed the database with Nigerian studio sample data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Atelier Ink Lagos data...")

        # ── Services (prices in Naira) ─────────────────────────────────────────
        services = []
        service_data = [
            ("Traditional Tattoo", "tattoo", 25000, 60, "Bold lines and classic flash work."),
            ("Fine Line Tattoo", "tattoo", 35000, 90, "Delicate single-needle line work."),
            ("Custom Tattoo", "tattoo", 50000, 120, "Fully custom design collaboration."),
            ("Nose Piercing", "piercing", 8000, 30, "Nostril or septum piercing with titanium jewellery."),
            ("Ear Constellation", "piercing", 15000, 45, "Multiple ear piercings curated together."),
            ("Tattoo Consultation", "consultation", 0, 30, "Free 30-min design consultation."),
        ]
        for name, cat, price, duration, desc in service_data:
            svc, _ = Service.objects.get_or_create(
                name=name, defaults={
                    "category": cat, "base_price": price,
                    "min_duration_minutes": duration, "description": desc,
                }
            )
            services.append(svc)
        self.stdout.write(f"  ✓ {len(services)} services (prices in ₦)")

        # ── Nigerian Artists ───────────────────────────────────────────────────
        artist_data = [
            {
                "email": "adaeze@atelierink.ng",
                "first_name": "Adaeze",
                "last_name": "Okonkwo",
                "bio": "Lagos-based fine line artist specialising in Afrocentric motifs, botanicals, and abstract geometry. 7 years of experience bringing intentional, lasting work to dark and light skin tones.",
                "instagram": "adaeze.ink",
                "avatar_url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
                "years": 7,
            },
            {
                "email": "emeka@atelierink.ng",
                "first_name": "Emeka",
                "last_name": "Nwosu",
                "bio": "Neo-traditional and blackwork specialist. Draws heavy inspiration from Igbo uli patterns and Yoruba adire textile art. Each piece is a conversation between heritage and modern tattooing.",
                "instagram": "emeka.nwosu.tattoo",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                "years": 9,
            },
            {
                "email": "zainab@atelierink.ng",
                "first_name": "Zainab",
                "last_name": "Bello",
                "bio": "Piercing specialist and minimalist tattoo artist from Abuja. Trained in London, now based in Lagos. Known for clean, precise piercings and delicate micro-scripts.",
                "instagram": "zainab.bello.studio",
                "avatar_url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
                "years": 5,
            },
        ]

        artists = []
        for data in artist_data:
            user, _ = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "role": User.Role.ARTIST,
                }
            )
            if not user.has_usable_password():
                user.set_password("atelierink123")
                user.save()

            artist, _ = Artist.objects.get_or_create(
                user=user,
                defaults={
                    "bio": data["bio"],
                    "instagram_handle": data["instagram"],
                    "avatar_url": data["avatar_url"],
                    "years_experience": data["years"],
                    "is_accepting_clients": True,
                }
            )
            artist.specialties.set(services[:3])
            artists.append(artist)

        # Working hours: Tue–Sat 10am–7pm (typical Lagos studio hours)
        for artist in artists:
            for day in [1, 2, 3, 4, 5]:  # Tue–Sat
                WorkingHours.objects.get_or_create(
                    artist=artist, day_of_week=day,
                    defaults={"start_time": time(10, 0), "end_time": time(19, 0)}
                )

        self.stdout.write(f"  ✓ {len(artists)} Nigerian artists")

        # ── Admin ──────────────────────────────────────────────────────────────
        admin, created = User.objects.get_or_create(
            email="admin@atelierink.ng",
            defaults={
                "first_name": "Studio", "last_name": "Admin",
                "role": User.Role.ADMIN, "is_staff": True, "is_superuser": True,
            }
        )
        if created:
            admin.set_password("admin123")
            admin.save()
        self.stdout.write("  ✓ admin@atelierink.ng / admin123")

        # ── Consultation slots (next 14 days) ─────────────────────────────────
        today = timezone.now().date()
        slots_created = 0
        for delta in range(1, 15):
            slot_date = today + timedelta(days=delta)
            # Skip Sundays (day 6)
            if slot_date.weekday() == 6:
                continue
            for artist in artists:
                for hour in [10, 11, 14, 15, 16]:
                    _, created = ConsultationSlot.objects.get_or_create(
                        artist=artist, date=slot_date, start_time=time(hour, 0),
                        defaults={"end_time": time(hour, 30), "status": "available"}
                    )
                    if created:
                        slots_created += 1
        self.stdout.write(f"  ✓ {slots_created} consultation slots")

        # ── Session blocks (next 14 days) ─────────────────────────────────────
        # Deposit = ₦5,000 (small for testing — as requested)
        blocks_created = 0
        tattoo_svc = services[0]
        for delta in range(1, 15):
            block_date = today + timedelta(days=delta)
            if block_date.weekday() == 6:
                continue
            for artist in artists:
                _, created = SessionBlock.objects.get_or_create(
                    artist=artist, date=block_date, start_time=time(12, 0),
                    defaults={
                        "end_time": time(17, 0),
                        "service": tattoo_svc,
                        "deposit_required": 5000,  # ₦5,000 deposit for testing
                        "status": "open",
                    }
                )
                if created:
                    blocks_created += 1
        self.stdout.write(f"  ✓ {blocks_created} session blocks (₦5,000 deposit)")

        self.stdout.write(self.style.SUCCESS(
            "\n✅ Done! Lagos studio data seeded.\n"
            "   Test login: admin@atelierink.ng / admin123\n"
            "   Artist login: adaeze@atelierink.ng / atelierink123"
        ))
