# Use official Python image
FROM python:3.12-slim

# Set working dir
WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y gcc libpq-dev

# Copy requirements - use production requirements without AWS EB CLI
COPY requirements-prod.txt requirements.txt

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

EXPOSE 8000

# Use gunicorn for production, bind to 0.0.0.0 so Render can detect the port
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "tourism_api.wsgi:application"]
