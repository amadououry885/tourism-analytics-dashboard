
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security / Debug ---
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-please-change")
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"

# When behind Elastic Beanstalk's load balancer, trust X-Forwarded-* headers
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# --- Hosts / CORS / CSRF ---
ALLOWED_HOSTS = ["*"]  # tighten later if you have a fixed domain

# Optional: allow-all CORS via env flag (defaults to off)
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "0") == "1"

# You can pass your EB CNAME or domain via env for stricter CORS/CSRF
EB_HOST = os.getenv("EB_HOST", "").strip()          # e.g. Tourism-analytics-env.eba-xxxx.elasticbeanstalk.com
FRONTEND_ORIGINS = [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "https://localhost:3000", "https://127.0.0.1:3000",
]

if not CORS_ALLOW_ALL_ORIGINS:
    # If not allowing all, use explicit allow-lists
    CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS.copy()
    if EB_HOST:
        CORS_ALLOWED_ORIGINS += [f"http://{EB_HOST}", f"https://{EB_HOST}"]

# CSRF must be scheme+host in Django 5
CSRF_TRUSTED_ORIGINS = [
    "https://*.elasticbeanstalk.com",
    "https://*.ap-southeast-1.elasticbeanstalk.com",
    # Add your own domain if/when you have one, e.g. "https://your-domain.com"
]
if EB_HOST:
    CSRF_TRUSTED_ORIGINS += [f"https://{EB_HOST}", f"http://{EB_HOST}"]

# --- Apps ---
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

# --- Middleware ---
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # keep CorsMiddleware high, before CommonMiddleware
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

# --- Database ---
# Reads standard RDS envs: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
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

# --- Passwords ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- i18n / tz ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kuala_Lumpur"
USE_I18N = True
USE_TZ = True

# --- Static / Media ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# --- DRF ---
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Prod cookie security (safe defaults) ---
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
