
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------
# Helpers
# -----------------------------
def _csv_env(name: str, default: list[str] | None = None) -> list[str]:
    val = os.getenv(name, "")
    if not val:
        return default or []
    return [s.strip() for s in val.split(",") if s.strip()]

# -----------------------------
# Security / Debug
# -----------------------------
# Accept both SECRET_KEY and DJANGO_SECRET_KEY (use whichever is set)
SECRET_KEY = os.getenv("SECRET_KEY") or os.getenv("DJANGO_SECRET_KEY", "dev-insecure-please-change")
DEBUG = os.getenv("DJANGO_DEBUG", os.getenv("DEBUG", "0")) == "1"

# When behind Elastic Beanstalk's load balancer, trust X-Forwarded-* headers
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# -----------------------------
# Hosts / CORS / CSRF
# -----------------------------
# EB CNAME (we’ll also call this EB_HOST locally)
EB_HOST = os.getenv("EB_CNAME", "").strip() or os.getenv("EB_HOST", "").strip()

# ALLOWED_HOSTS from envs you already have in EB. Falls back to wildcard for now.
allowed_hosts = _csv_env("DJANGO_ALLOWED_HOSTS") or _csv_env("ALLOWED_HOSTS") or ["*"]
ALLOWED_HOSTS = allowed_hosts

# CORS
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "0") == "1"
FRONTEND_DEFAULTS = [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "https://localhost:3000", "https://127.0.0.1:3000",
]
if CORS_ALLOW_ALL_ORIGINS:
    # Let django-cors-headers handle allow-all
    pass
else:
    CORS_ALLOWED_ORIGINS = (
        _csv_env("CORS_ALLOWED_ORIGINS", FRONTEND_DEFAULTS.copy())
    )
    if EB_HOST:
        # ensure EB host is present
        for scheme in ("http", "https"):
            url = f"{scheme}://{EB_HOST}"
            if url not in CORS_ALLOWED_ORIGINS:
                CORS_ALLOWED_ORIGINS.append(url)

# CSRF (Django 5 requires scheme+host)
csrf_defaults = [
    "https://*.elasticbeanstalk.com",
    "https://*.ap-southeast-1.elasticbeanstalk.com",
]
CSRF_TRUSTED_ORIGINS = _csv_env("CSRF_TRUSTED_ORIGINS", csrf_defaults.copy())
if EB_HOST:
    for scheme in ("https", "http"):
        url = f"{scheme}://{EB_HOST}"
        if url not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(url)

# -----------------------------
# Apps
# -----------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "analytics",
]

# -----------------------------
# Middleware
# -----------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",   # keep before CommonMiddleware
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

# -----------------------------
# Database
# -----------------------------
# USE_SQLITE=1 in EB env makes deployment independent of RDS while you sort SG/Networking.
USE_SQLITE = os.getenv("USE_SQLITE", "0") == "1"

if USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DB_NAME = os.getenv("DB_NAME", "tourism")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_HOST = os.getenv("DB_HOST", "db")  # local docker default
    DB_PORT = os.getenv("DB_PORT", "5432")

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST,
            "PORT": DB_PORT,
            "CONN_MAX_AGE": 60,
        }
    }

# -----------------------------
# Passwords
# -----------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -----------------------------
# i18n / tz
# -----------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kuala_Lumpur"
USE_I18N = True
USE_TZ = True

# -----------------------------
# Static / Media
# -----------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# -----------------------------
# DRF
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -----------------------------
# Prod cookie security
# -----------------------------
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
