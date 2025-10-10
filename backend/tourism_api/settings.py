"""
Django settings for tourism_api (cloud-ready).
Works locally and on AWS Elastic Beanstalk.
"""

from pathlib import Path
import os
import dj_database_url

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

def env_list(name: str, default: str = ""):
    return [x.strip() for x in os.getenv(name, default).split(",") if x.strip()]

# ------------------------------------------------------------
# Core
# ------------------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-please-change")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"

# Hostnames
APP_HOSTNAME = os.getenv("APP_HOSTNAME", "").strip()  # e.g. tourism-analytics-env.eba-xxxxx.ap-southeast-1.elasticbeanstalk.com

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",  # docker compose service (local)
]
if APP_HOSTNAME:
    # Accept both bare host and its lowercase variant for safety
    ALLOWED_HOSTS += [APP_HOSTNAME, APP_HOSTNAME.lower()]

# ------------------------------------------------------------
# Applications
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
# Middleware
# ------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise serves collected static files on EB
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",   # keep high
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
# Priority: DATABASE_URL (if present) → explicit DB_* env vars → local docker defaults
# ------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", os.getenv("POSTGRES_DB", "tourism")),
        "USER": os.getenv("DB_USER", os.getenv("POSTGRES_USER", "postgres")),
        "PASSWORD": os.getenv("DB_PASSWORD", os.getenv("POSTGRES_PASSWORD", "postgres")),
        "HOST": os.getenv("DB_HOST", os.getenv("POSTGRES_HOST", "db")),  # "db" == docker service name for local
        "PORT": os.getenv("DB_PORT", os.getenv("POSTGRES_PORT", "5432")),
    }
}

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    # Allows easy override with a single URL; keeps persistent connections
    DATABASES["default"] = dj_database_url.parse(DATABASE_URL, conn_max_age=60)

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
# Static / Media (EB + WhiteNoise)
# ------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ------------------------------------------------------------
# DRF
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
# CORS / CSRF
# By default allow localhost:3000 (dev). You can add EB host via env:
# CORS_ALLOWED_ORIGINS="http://<eb-host>,https://<eb-host>"
# CSRF_TRUSTED_ORIGINS="http://<eb-host>,https://<eb-host>"
# ------------------------------------------------------------
default_cors = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if APP_HOSTNAME:
    default_cors += [f"http://{APP_HOSTNAME}", f"https://{APP_HOSTNAME}"]

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", ",".join(default_cors))
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    ",".join([origin for origin in default_cors if origin.startswith("http")]),
)
# If you need credentials later:
# CORS_ALLOW_CREDENTIALS = True

# ------------------------------------------------------------
# Default primary key type
# ------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------
# Basic logging (handy on EB)
# ------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
