# Use official Python image
FROM python:3.9-slim-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies needed for psycopg2 (PostgreSQL client lib)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install gunicorn  # WSGI server

# Copy project files
COPY . .

# Expose Django app port
EXPOSE 8000

# Healthcheck (optional but good practice)
HEALTHCHECK CMD curl --fail http://localhost:8000/health/ || exit 1

# Command:
# 1. Wait for DB (using pg_isready, no hardcoded password — it will read from env vars)
# 2. Run migrations
# 3. Start Gunicorn WSGI server
CMD sh -c "until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$POSTGRES_USER; do echo 'Waiting for DB...'; sleep 5; done && \
    python manage.py migrate && \
    gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4"
