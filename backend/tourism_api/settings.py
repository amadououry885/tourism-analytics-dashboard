"""
Django settings for tourism_api project.

Works for:
- Local dev / Docker (POSTGRES_* envs or defaults)
- Elastic Beanstalk production (DB_* envs, *.elasticbeanstalk.com hosts)
"""

from pathlib import Path
import os

# ------------------------------------------------------------
# Base
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-please-change")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"

# ------------------------------------------------------------
# Hosts / CSRF (env-driven; safe defaults for dev)
# In EB, set env vars:
#   ALLOWED_HOSTS=your-env.us-east-1.elasticbeanstalk.com,*.elasticbeanstalk.com
#   CSRF_TRUSTED_ORIGINS=https://your-env.us-east-1.elasticbeanstalk.com,https://*.elasticbeanstalk.com
# ------------------------------------------------------------
_default_allowed = "localhost,127.0.0.1,backend"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", _default_allowed).split(",") if h.strip()]

_default_csrf = "http://localhost:3000,http://127.0.0.1:3000"
CSRF_TRUSTED_ORIGINS = [u.strip() for u in os.getenv("CSRF_TRUSTED_ORIGINS", _default_csrf).split(",") if u.strip()]

# ------------------------------------------------------------
# Installed apps
# ------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local apps
    "analytics",
]

# ------------------------------------------------------------
# Middleware (CORS must be before Common/CSRF)
# WhiteNoise is added for static files in EB
# ------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # serve static files in EB
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",       # keep high
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

# ------------------------------------------------------------
# Database
# - EB: expects DB_* vars
# - Docker/dev: uses POSTGRES_* (or defaults)
# ------------------------------------------------------------
DB_NAME = os.getenv("DB_NAME") or os.getenv("POSTGRES_DB", "tourism")
DB_USER = os.getenv("DB_USER") or os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD") or os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST") or os.getenv("POSTGRES_HOST", "db")  # 'db' is docker-compose service name
DB_PORT = os.getenv("DB_PORT") or os.getenv("POSTGRES_PORT", "5432")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}

# ------------------------------------------------------------
# Password validation
# ------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------
# i18n / Timezone
# ------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kuala_Lumpur"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------
# Static / Media
# ------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# WhiteNoise production storage (hashed filenames)
# Safe in dev too; remove if you prefer plain dev behavior.
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ------------------------------------------------------------
# DRF (dev-open; tighten later)
# ------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}

# ------------------------------------------------------------
# CORS (CRA on :3000 by default)
# ------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# ------------------------------------------------------------
# Default primary key type
# ------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
