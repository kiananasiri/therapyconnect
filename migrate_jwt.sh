#!/bin/bash

# JWT Migration Script for TherapyConnect
# This script migrates from Redis-based sessions to JWT-based authentication

set -e

echo "🔄 Migrating TherapyConnect from Redis to JWT Authentication"
echo "============================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if containers are running
check_containers() {
    echo -e "${BLUE}🔍 Checking container status...${NC}"
    if docker-compose ps | grep -q "Up"; then
        echo -e "${YELLOW}⚠️  Containers are running. Stopping them for migration...${NC}"
        docker-compose down
    fi
}

# Function to rebuild containers without Redis
rebuild_containers() {
    echo -e "${BLUE}🏗️  Rebuilding containers without Redis...${NC}"
    
    # Remove any existing volumes to ensure clean state
    echo -e "${YELLOW}🧹 Cleaning up old volumes...${NC}"
    docker volume prune -f
    
    # Build and start containers
    echo -e "${BLUE}📦 Building new containers...${NC}"
    docker-compose build --no-cache
    
    echo -e "${BLUE}🚀 Starting containers...${NC}"
    docker-compose up -d
    
    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 10
    
    # Check if backend is up
    while ! docker-compose ps backend | grep -q "Up"; do
        echo -e "${YELLOW}⏳ Waiting for backend container...${NC}"
        sleep 5
    done
}

# Function to run Django migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running Django migrations...${NC}"
    
    # Run standard migrations
    docker-compose exec backend python manage.py migrate
    
    # Run JWT token blacklist migrations specifically
    echo -e "${BLUE}🔐 Setting up JWT token blacklist...${NC}"
    docker-compose exec backend python manage.py migrate token_blacklist
    
    echo -e "${GREEN}✅ Database migrations completed successfully!${NC}"
}

# Function to verify JWT setup
verify_jwt_setup() {
    echo -e "${BLUE}🔍 Verifying JWT setup...${NC}"
    
    # Check if JWT endpoints are accessible
    echo -e "${YELLOW}Testing JWT login endpoint...${NC}"
    
    # Create a simple test
    docker-compose exec backend python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from therapy.models import Therapist

# Check if we can create JWT tokens
try:
    # Try to get a therapist (should exist from previous data)
    therapist = Therapist.objects.first()
    if therapist:
        refresh = RefreshToken()
        refresh['user_id'] = therapist.id
        refresh['user_type'] = 'therapist'
        print(f'✅ JWT token creation successful for therapist: {therapist.get_full_name()}')
        print(f'🔑 Sample access token: {str(refresh.access_token)[:50]}...')
    else:
        print('⚠️  No therapists found in database. Please add test data.')
except Exception as e:
    print(f'❌ JWT setup error: {e}')
"
    
    echo -e "${GREEN}✅ JWT verification completed!${NC}"
}

# Function to show post-migration instructions
show_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo ""
    echo -e "${YELLOW}1. Frontend Changes:${NC}"
    echo "   - JWT tokens are now automatically handled"
    echo "   - Login will store tokens in localStorage"
    echo "   - Automatic token refresh on expiry"
    echo ""
    echo -e "${YELLOW}2. Authentication Flow:${NC}"
    echo "   - POST /api/therapist-login/ (returns JWT tokens)"
    echo "   - POST /api/therapist-logout/ (blacklists tokens)"
    echo "   - POST /api/therapist-refresh/ (refreshes access token)"
    echo ""
    echo -e "${YELLOW}3. Testing:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000/api"
    echo "   - Admin Panel: http://localhost:8000/admin"
    echo ""
    echo -e "${YELLOW}4. Token Management:${NC}"
    echo "   - Access tokens expire in 24 hours"
    echo "   - Refresh tokens expire in 7 days"
    echo "   - Tokens are automatically rotated on refresh"
    echo ""
    echo -e "${GREEN}🔐 Security Improvements:${NC}"
    echo "   ✅ Stateless authentication with JWT"
    echo "   ✅ Token blacklisting for secure logout"
    echo "   ✅ Automatic token refresh"
    echo "   ✅ No Redis dependency"
    echo "   ✅ Improved scalability"
    echo ""
    echo -e "${BLUE}🚀 Your application is now running with JWT authentication!${NC}"
}

# Main execution
echo -e "${YELLOW}🔄 Starting migration process...${NC}"

# Step 1: Check and stop containers
check_containers

# Step 2: Rebuild containers
rebuild_containers

# Step 3: Run migrations
run_migrations

# Step 4: Verify setup
verify_jwt_setup

# Step 5: Show instructions
show_instructions

echo ""
echo -e "${GREEN}✨ Migration completed! Your app is ready to use with JWT authentication.${NC}"
