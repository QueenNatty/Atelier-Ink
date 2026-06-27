"""
Usage: python manage.py seed_dev_data
Creates sample artists, services, slots and session blocks for local development.
"""
import random
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.studio.models import Artist, Service, WorkingHours
from apps.bookings.models import ConsultationSlot, SessionBlock


class Command(BaseCommand):
    help = "Seed the database with sample data for development"

    def handle(self, *args, **options):
        self.stdout.write("Seeding dev data…")

        # ── Services ──────────────────────────────────────────────────────────
        services = [
            Service.objects.get_or_create(
                name="Traditional Tattoo", category="tattoo",
                defaults={"base_price": 150, "min_duration_minutes": 60, "description": "Bold lines and classic flash."}
            )[0],
            Service.objects.get_or_create(
                name="Fine Line Tattoo", category="tattoo",
                defaults={"base_price": 180, "min_duration_minutes": 90, "description": "Delicate single-needle work."}
            )[0],
            Service.objects.get_or_create(
                name="Nose Piercing", category="piercing",
                defaults={"base_price": 40, "min_duration_minutes": 30, "description": "Nostril or septum piercing."}
            )[0],
            Service.objects.get_or_create(
                name="Ear Constellation", category="piercing",
                defaults={"base_price": 80, "min_duration_minutes": 45, "description": "Multiple ear piercings curated together."}
            )[0],
            Service.objects.get_or_create(
                name="Tattoo Consultation", category="consultation",
                defaults={"base_price": 0, "min_duration_minutes": 30, "description": "Free 30-min design consultation."}
            )[0],
        ]
        self.stdout.write(f"  ✓ {len(services)} services")

        # ── Artists ───────────────────────────────────────────────────────────
        artist_data = [
            {"email": "maya@inkbound.com", "first_name": "Maya", "last_name": "Rivera"},
            {"email": "kai@inkbound.com", "first_name": "Kai", "last_name": "Chen"},
        ]
        artists = []
        for data in artist_data:
            user, _ = User.objects.get_or_create(
                email=data["email"],
                defaults={**data, "role": User.Role.ARTIST}
            )
            if not user.has_usable_password():
                user.set_password("inkbound123")
                user.save()
            artist, _ = Artist.objects.get_or_create(
                user=user, defaults={"bio": f"{user.first_name} is a skilled artist.", "years_experience": random.randint(3, 10)}
            )
            artist.specialties.set(services[:3])
            artists.append(artist)

        # Working hours Mon–Sat
        for artist in artists:
            for day in range(0, 6):
                WorkingHours.objects.get_or_create(
                    artist=artist, day_of_week=day,
                    defaults={"start_time": time(10, 0), "end_time": time(18, 0)}
                )
        self.stdout.write(f"  ✓ {len(artists)} artists")

        # ── Admin user ────────────────────────────────────────────────────────
        admin, created = User.objects.get_or_create(
            email="admin@inkbound.com",
            defaults={"first_name": "Studio", "last_name": "Admin", "role": User.Role.ADMIN, "is_staff": True, "is_superuser": True}
        )
        if created:
            admin.set_password("admin123")
            admin.save()
        self.stdout.write("  ✓ admin@inkbound.com / admin123")

        # ── Consultation slots ────────────────────────────────────────────────
        today = timezone.now().date()
        slots_created = 0
        for delta in range(1, 8):
            slot_date = today + timedelta(days=delta)
            for artist in artists:
                for hour in [10, 11, 14, 15]:
                    _, created = ConsultationSlot.objects.get_or_create(
                        artist=artist, date=slot_date, start_time=time(hour, 0),
                        defaults={"end_time": time(hour, 30), "status": "available"}
                    )
                    if created:
                        slots_created += 1
        self.stdout.write(f"  ✓ {slots_created} consultation slots")

        # ── Session blocks ────────────────────────────────────────────────────
        blocks_created = 0
        tattoo_service = services[0]
        for delta in range(1, 8):
            block_date = today + timedelta(days=delta)
            for artist in artists:
                _, created = SessionBlock.objects.get_or_create(
                    artist=artist, date=block_date, start_time=time(12, 0),
                    defaults={
                        "end_time": time(17, 0),
                        "service": tattoo_service,
                        "deposit_required": 50,
                        "status": "open",
                    }
                )
                if created:
                    blocks_created += 1
        self.stdout.write(f"  ✓ {blocks_created} session blocks")

        self.stdout.write(self.style.SUCCESS("\nDone! Seed data ready."))
