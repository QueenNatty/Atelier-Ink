from .base import *  # noqa
from decouple import config, Csv
import os
import dj_database_url

DEBUG = False

ALLOWED_HOSTS=['*']

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=60,
        ssl_require=True
    )
}

CORS_ALLOWED_ORIGINS =  [
    os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
    "https://atelier-ink.onrender.com"
]

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
