#!/bin/bash

# Therapist Data Extraction Script for Docker Container
# This script provides easy methods to extract therapist data from your running container

set -e

echo "🏥 TherapyConnect - Therapist Data Extractor"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if containers are running
check_containers() {
    if ! docker-compose ps backend | grep -q "Up"; then
        echo -e "${RED}❌ Error: Backend container is not running${NC}"
        echo "   Start containers first: docker-compose up -d"
        exit 1
    fi
    
    if ! docker-compose ps db | grep -q "Up"; then
        echo -e "${RED}❌ Error: Database container is not running${NC}"
        echo "   Start containers first: docker-compose up -d"
        exit 1
    fi
}

# Function to copy extraction script to container
setup_extraction_script() {
    echo -e "${BLUE}📋 Setting up extraction script in container...${NC}"
    docker cp extract_therapist_data.py $(docker-compose ps -q backend):/app/extract_therapist_data.py
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [METHOD] [OPTIONS]"
    echo ""
    echo "Methods:"
    echo "  list              - List all therapists (default)"
    echo "  details           - Show detailed therapist information"
    echo "  summary           - Show therapist summary statistics"
    echo "  export-json       - Export all data to JSON file"
    echo "  export-csv        - Export all data to CSV file"
    echo "  sql               - Use raw SQL extraction method"
    echo "  django-shell      - Open Django shell for manual queries"
    echo "  db-shell          - Open PostgreSQL shell"
    echo ""
    echo "Options:"
    echo "  --filter ID       - Filter by specific therapist ID (e.g., t_abc123)"
    echo "  --help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 details --filter t_abc123"
    echo "  $0 export-json"
    echo "  $0 summary"
    echo "  $0 sql"
}

# Function to extract data using different methods
extract_data() {
    local method=$1
    local filter_id=$2
    
    case $method in
        "list"|"")
            echo -e "${GREEN}📋 Listing all therapists...${NC}"
            if [ -n "$filter_id" ]; then
                docker-compose exec backend python extract_therapist_data.py --method django --filter "id=$filter_id"
            else
                docker-compose exec backend python extract_therapist_data.py --method django
            fi
            ;;
        "details")
            echo -e "${GREEN}📋 Showing detailed therapist information...${NC}"
            if [ -n "$filter_id" ]; then
                docker-compose exec backend python extract_therapist_data.py --method django --filter "id=$filter_id"
            else
                docker-compose exec backend python extract_therapist_data.py --method django
            fi
            ;;
        "summary")
            echo -e "${GREEN}📊 Generating therapist summary...${NC}"
            docker-compose exec backend python extract_therapist_data.py --method summary
            ;;
        "export-json")
            echo -e "${GREEN}💾 Exporting therapist data to JSON...${NC}"
            local timestamp=$(date +"%Y%m%d_%H%M%S")
            local filename="therapist_export_${timestamp}.json"
            if [ -n "$filter_id" ]; then
                docker-compose exec backend python extract_therapist_data.py --method django --output file --export "$filename" --filter "id=$filter_id"
            else
                docker-compose exec backend python extract_therapist_data.py --method django --output file --export "$filename"
            fi
            # Copy file from container to host
            docker cp $(docker-compose ps -q backend):/app/$filename ./$filename
            echo -e "${GREEN}✅ File copied to host: ./$filename${NC}"
            ;;
        "export-csv")
            echo -e "${GREEN}💾 Exporting therapist data to CSV...${NC}"
            local timestamp=$(date +"%Y%m%d_%H%M%S")
            local filename="therapist_export_${timestamp}.csv"
            if [ -n "$filter_id" ]; then
                docker-compose exec backend python extract_therapist_data.py --method django --output csv --export "$filename" --filter "id=$filter_id"
            else
                docker-compose exec backend python extract_therapist_data.py --method django --output csv --export "$filename"
            fi
            # Copy file from container to host
            docker cp $(docker-compose ps -q backend):/app/$filename ./$filename
            echo -e "${GREEN}✅ File copied to host: ./$filename${NC}"
            ;;
        "sql")
            echo -e "${GREEN}🔍 Using raw SQL extraction...${NC}"
            if [ -n "$filter_id" ]; then
                docker-compose exec backend python extract_therapist_data.py --method sql --filter "id=$filter_id"
            else
                docker-compose exec backend python extract_therapist_data.py --method sql
            fi
            ;;
        "django-shell")
            echo -e "${GREEN}🐍 Opening Django shell...${NC}"
            echo "Available models: Patient, Therapist, Session, Payment, Review"
            echo "Example queries:"
            echo "  Therapist.objects.all()"
            echo "  Therapist.objects.get(id='t_abc123')"
            echo "  Therapist.objects.filter(years_active__gte=5)"
            echo ""
            docker-compose exec backend python manage.py shell
            ;;
        "db-shell")
            echo -e "${GREEN}🗄️  Opening PostgreSQL shell...${NC}"
            echo "Connected to therapy_db database"
            echo "Available tables: therapists, patients, sessions, payments, reviews"
            echo "Example queries:"
            echo "  SELECT * FROM therapists;"
            echo "  SELECT id, first_name, last_name, average_score FROM therapists;"
            echo "  \\q to quit"
            echo ""
            docker-compose exec db psql -U mmd -d therapy_db
            ;;
        *)
            echo -e "${RED}❌ Unknown method: $method${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Function to show quick therapist info
show_quick_info() {
    echo -e "${BLUE}🔍 Quick Therapist Overview${NC}"
    echo "=========================="
    
    # Count therapists
    local count=$(docker-compose exec -T backend python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from therapy.models import Therapist
print(Therapist.objects.count())
" 2>/dev/null | tr -d '\r')
    
    echo -e "Total Therapists: ${GREEN}$count${NC}"
    
    if [ "$count" -gt 0 ]; then
        echo ""
        echo "Available Therapist IDs:"
        docker-compose exec -T backend python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from therapy.models import Therapist
for t in Therapist.objects.all():
    print(f'  - {t.id}: {t.first_name} {t.last_name}')
" 2>/dev/null | tr -d '\r'
    fi
    echo ""
}

# Parse command line arguments
METHOD=""
FILTER_ID=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_usage
            exit 0
            ;;
        --filter)
            FILTER_ID="$2"
            shift 2
            ;;
        *)
            if [ -z "$METHOD" ]; then
                METHOD="$1"
            else
                echo -e "${RED}❌ Unknown option: $1${NC}"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Default method
if [ -z "$METHOD" ]; then
    METHOD="list"
fi

# Main execution
echo -e "${YELLOW}🔍 Checking container status...${NC}"
check_containers

echo -e "${YELLOW}📋 Setting up extraction tools...${NC}"
setup_extraction_script

# Show quick info first
show_quick_info

# Execute the requested method
extract_data "$METHOD" "$FILTER_ID"

echo ""
echo -e "${GREEN}✅ Data extraction completed!${NC}"

# Show helpful tips
echo ""
echo -e "${BLUE}💡 Helpful Tips:${NC}"
echo "  • Use 'django-shell' for interactive Python queries"
echo "  • Use 'db-shell' for direct SQL queries"
echo "  • Use '--filter t_abc123' to get specific therapist data"
echo "  • Export options create files you can analyze offline"
echo ""
echo -e "${BLUE}🔄 To run again:${NC} $0 [method] [options]"
