from pathlib import Path
import os
import logging
from dotenv import load_dotenv
import dj_database_url  # ✨ NEW: For production database URLs

# ── Load Environment Variables ────────────────────────────────────────────────
# Load .env file from backend directory
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent  # points to backend/

# ── Environment / Security / Debug ────────────────────────────────────────────
ENV = os.getenv("ENV", "development").strip().lower()
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() in {"1", "true", "yes"}
DEBUG_PROPAGATE_EXCEPTIONS = DEBUG

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-key-change-me")

# ── Helper for comma-separated lists ──────────────────────────────────────────
def _split_env(name: str, default: str = ""):
    val = os.environ.get(name, default)
    return [s.strip() for s in val.split(",") if s.strip()]

# ── Hosts / CORS / CSRF ───────────────────────────────────────────────────────
# ✨ UPDATED: Production-ready hosts (includes AWS EB)
ALLOWED_HOSTS = _split_env("ALLOWED_HOSTS", "localhost,127.0.0.1,.onrender.com,.vercel.app,.elasticbeanstalk.com,.amazonaws.com")

# ✨ UPDATED: Production CORS
if ENV == "production":
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = _split_env(
        "CORS_ALLOWED_ORIGINS",
        "https://tourism-analytics-dashboard.vercel.app"
    )
else:
    CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = _split_env(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app,https://*.onrender.com,https://*.elasticbeanstalk.com,https://*.amazonaws.com"
)

# ── Google Maps API ───────────────────────────────────────────────────────────
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# ── Installed apps ────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # your apps
    "users",  # Custom user model - must be before other apps
    "analytics",
    "vendors",
    "events",
    "transport",
    "stays",
    "api",
    
]

# ── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "tourism_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "tourism_api.wsgi.application"

# ── Database (Local SQLite only) ──────────────────────────────────────────────
SQLITE_PATH = os.getenv("SQLITE_PATH", str(BASE_DIR / "data" / "db.sqlite3"))
os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)

# ✨ UPDATED: Production-ready database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Debug: Print what we're using (will show in logs)
import logging
logger = logging.getLogger(__name__)

if DATABASE_URL and DATABASE_URL.startswith(("postgres://", "postgresql://")):
    # Production: Use PostgreSQL from DATABASE_URL
    logger.info(f"Using PostgreSQL database from DATABASE_URL")
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Development: Use SQLite (also fallback if DATABASE_URL is invalid)
    logger.warning(f"DATABASE_URL not found or invalid, using SQLite at {SQLITE_PATH}")
    DATABASES = {
        "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": SQLITE_PATH}
    }

# ── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── i18n / tz ─────────────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kuala_Lumpur"
USE_I18N = True
USE_TZ = True

# ── Static / Media ────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── DRF ───────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# ── JWT Settings ──────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── Custom User Model ─────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'users.User'

# ── HTTPS / Cookies ───────────────────────────────────────────────────────────
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SAMESITE = "Lax"

# ── Logging ──────────────────────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Celery Configuration ─────────────────────────────────────────────────────
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# ── Email Configuration (Gmail for Development) ──────────────────────────────
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Kedah Tourism <noreply@localhost>')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

logging.getLogger(__name__).info(
    f"Running in {ENV.upper()} mode using SQLite DB → {SQLITE_PATH}"
)
