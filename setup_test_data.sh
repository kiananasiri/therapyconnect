#!/bin/bash

# TherapyConnect Test Data Setup Script
# This script sets up the Django environment and runs the test data generators

echo "🏥 TherapyConnect Test Data Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Error: Please run this script from the therapyconnect root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📦 Setting up Django environment..."

# Run migrations to ensure database is up to date
echo "🔄 Running database migrations..."
python manage.py migrate

# Check if migration was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Database migration failed"
    exit 1
fi

echo "✅ Database migrations completed"

# Go back to root directory
cd ..

echo "🌱 Creating test data for dashboard..."

# Run the dashboard data generator
python add_dashboard_data.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 What's been created:"
    echo "   - Therapist: Dr. Alice Smith (t_abc123)"
    echo "   - 5 test patients with realistic data"
    echo "   - 20+ sessions (past and future)"
    echo "   - Proper relationships between all data"
    echo ""
    echo "🚀 You can now:"
    echo "   1. Start the Django backend: cd backend && python manage.py runserver"
    echo "   2. Start the React frontend: cd frontend && npm start"
    echo "   3. View the therapist dashboard with real data!"
    echo ""
else
    echo "❌ Error: Test data creation failed"
    exit 1
fi
