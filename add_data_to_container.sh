#!/bin/bash

# Quick script to add test data to running Docker containers
# Use this if your containers are already running

echo "🏥 Adding Test Data to Running Container"
echo "======================================="

# Check if backend container is running
if ! docker-compose ps backend | grep -q "Up"; then
    echo "❌ Error: Backend container is not running"
    echo "   Start containers first: docker-compose up -d"
    exit 1
fi

echo "🔄 Running migrations in container..."
docker-compose exec backend python manage.py migrate

echo "🌱 Creating dashboard test data..."

# Copy our test data script into the container and run it
docker cp add_dashboard_data.py $(docker-compose ps -q backend):/app/add_dashboard_data.py
docker-compose exec backend python add_dashboard_data.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test data added successfully!"
    echo "🎯 Your therapist dashboard now has real data!"
else
    echo "❌ Error adding test data"
    echo "   Check logs: docker-compose logs backend"
fi
