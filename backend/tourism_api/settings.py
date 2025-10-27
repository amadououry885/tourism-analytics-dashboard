# backend/tourism_api/settings.py
from pathlib import Path
import os

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent  # points to backend/

# ── Security / Debug ───────────────────────────────────────────────────────────
# DJANGO_DEBUG may be "true"/"false" or "1"/"0"
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() in {"1", "true", "yes"}
DEBUG_PROPAGATE_EXCEPTIONS = DEBUG

# Always load SECRET_KEY from env in prod. A fallback exists for local dev only.
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-key-change-me")

# Behind EB's load balancer, trust X-Forwarded-* so Django knows it's HTTPS.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# ── Small helper for comma-sep env lists ───────────────────────────────────────
def _split_env(name: str, default: str = ""):
    val = os.environ.get(name, default)
    return [s.strip() for s in val.split(",") if s.strip()]

# ── Hosts / CORS / CSRF ────────────────────────────────────────────────────────
# Example: DJANGO_ALLOWED_HOSTS="tourism-analytics-env.eba-xxxx.ap-southeast-1.elasticbeanstalk.com,localhost,127.0.0.1"
_allowed = os.getenv("DJANGO_ALLOWED_HOSTS", "")
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(",") if h.strip()] or ["*"]

# If you know your EB CNAME/URL, set it so we can add precise CORS/CSRF.
# e.g. EB_HOST="tourism-analytics-env.eba-xxxx.ap-southeast-1.elasticbeanstalk.com"
EB_HOST = os.getenv("EB_HOST", "").strip()

# Local dev frontends you use (includes 3001 for your React dev server)
FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # optional local HTTPS (mkcert etc.)
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "https://localhost:3001",
    "https://127.0.0.1:3001",
]

# Allow-all only if explicitly enabled
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "0") in {"1", "true", "yes"}

if not CORS_ALLOW_ALL_ORIGINS:
    # Start with local dev origins
    CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS.copy()

    # Add EB host (http + https) if provided
    if EB_HOST:
        CORS_ALLOWED_ORIGINS += [f"http://{EB_HOST}", f"https://{EB_HOST}"]

    # Also merge any explicit env values (so eb setenv can override/extend)
    extra = _split_env("CORS_ALLOWED_ORIGINS")
    for o in extra:
        if o not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(o)

# CSRF: Django 5 requires scheme+host entries
CSRF_TRUSTED_ORIGINS = [
    # Local dev
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # EB wildcards (https)
    "https://*.elasticbeanstalk.com",
    "https://*.ap-southeast-1.elasticbeanstalk.com",
]
if EB_HOST:
    CSRF_TRUSTED_ORIGINS += [f"https://{EB_HOST}", f"http://{EB_HOST}"]

# Merge any explicit env additions
for o in _split_env("CSRF_TRUSTED_ORIGINS"):
    if o not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(o)

# ── Apps ───────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Project apps
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
    "corsheaders.middleware.CorsMiddleware",   # keep high, before CommonMiddleware
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

# ── Database (RDS first; local fallback if DB_HOST not set) ────────────────────
DB_HOST = os.getenv("DB_HOST")
if DB_HOST:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "tourism"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": DB_HOST,
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": 60,
            # Tip: uncomment if your RDS requires SSL
            # "OPTIONS": {"sslmode": "require"},
        }
    }
else:
    # Local/dev fallback only
    SQLITE_PATH = os.getenv("SQLITE_PATH", str(BASE_DIR / "data" / "db.sqlite3"))
    os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": SQLITE_PATH,
        }
    }

# ── Passwords ─────────────────────────────────────────────────────────────────
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
# Django 5 style (optional, fine to leave as-is with STATICFILES_STORAGE):
# STORAGES = {
#     "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
#     "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
# }

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── DRF ───────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )

# Only force secure cookies when we explicitly enable HTTPS at the load balancer
if os.environ.get("ENABLE_HTTPS", "0") in {"1", "true", "yes"}:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
else:
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
