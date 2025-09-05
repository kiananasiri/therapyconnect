# Use official Python image
FROM python:3.9-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies needed for PostgreSQL
RUN apt-get update && apt-get install -y \
    pkg-config \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Install system dependencies needed for PostgreSQL
RUN apt-get update \
    && apt-get install -y \
       pkg-config \
       libpq-dev \
       build-essential \
       postgresql-client-15 \
    && rm -rf /var/lib/apt/lists/*

# Wait for PostgreSQL to be ready, apply migrations, and start server
CMD ["sh", "-c", "until pg_isready -h db -p 5432 -U mmd; do sleep 5; done && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

