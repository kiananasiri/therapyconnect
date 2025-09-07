#!/bin/bash

# TherapyConnect Test Data Setup Script (Docker Version)
# This script sets up test data using Docker containers

echo "🏥 TherapyConnect Test Data Setup (Docker)"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the therapyconnect root directory"
    echo "   Make sure docker-compose.yml exists"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker and try again"
    exit 1
fi

echo "🐳 Starting Docker containers..."

# Start the containers (this will build if needed)
docker-compose up -d

# Wait a moment for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check if backend container is running
if ! docker-compose ps backend | grep -q "Up"; then
    echo "❌ Error: Backend container is not running"
    echo "   Try: docker-compose logs backend"
    exit 1
fi

echo "📦 Setting up Django environment in container..."

# Run migrations inside the backend container
echo "🔄 Running database migrations..."
docker-compose exec backend python manage.py migrate

# Check if migration was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Database migration failed"
    echo "   Check logs with: docker-compose logs backend"
    exit 1
fi

echo "✅ Database migrations completed"

echo "🌱 Creating test data for dashboard..."

# Copy the test data script into the container and run it
docker-compose exec backend python -c "
import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from therapy.models import Patient, Therapist, Session, Payment

# Mock therapist ID used in the frontend
MOCK_THERAPIST_ID = 't_abc123'

def create_dashboard_therapist():
    print('Creating dashboard therapist...')
    
    # Check if therapist already exists
    if Therapist.objects.filter(id=MOCK_THERAPIST_ID).exists():
        print(f'Therapist {MOCK_THERAPIST_ID} already exists, updating...')
        therapist = Therapist.objects.get(id=MOCK_THERAPIST_ID)
        # Update with fresh data
        therapist.first_name = 'Alice'
        therapist.last_name = 'Smith'
        therapist.about_note = 'I am a licensed therapist specializing in Cognitive Behavioral Therapy with over 15 years of experience.'
        therapist.area_of_expertise = ['Cognitive Behavioral Therapy', 'Stress Management', 'Anxiety Disorders', 'Depression']
        therapist.wallet_balance = Decimal('1250.00')
        therapist.average_score = Decimal('4.8')
        therapist.save()
    else:
        therapist = Therapist.objects.create(
            id=MOCK_THERAPIST_ID,
            password='12345678',
            first_name='Alice',
            last_name='Smith',
            ssn='123-45-6789',
            phone_no='+15551234567',
            email='alice.smith@therapyconnect.com',
            date_of_birth=date(1975, 4, 12),
            sex='F',
            education=[
                'PhD in Clinical Psychology - Harvard University',
                'MA in Counseling Psychology - Stanford University'
            ],
            area_of_expertise=['Cognitive Behavioral Therapy', 'Stress Management', 'Anxiety Disorders', 'Depression'],
            about_note='I am a licensed therapist specializing in Cognitive Behavioral Therapy with over 15 years of experience.',
            years_active=15,
            verified_certificates=['Licensed Clinical Psychologist', 'CBT Certification'],
            average_score=Decimal('4.8'),
            wallet_balance=Decimal('1250.00'),
            house_addr='123 Therapy Lane, Wellness City, CA 90210',
            work_addr='456 Professional Blvd, Suite 789, Wellness City, CA 90210'
        )
    
    print(f'✅ Created/Updated therapist: Dr. {therapist.get_full_name()} ({therapist.id})')
    return therapist

def create_dashboard_patients(therapist):
    print('Creating patients for dashboard...')
    
    patients_data = [
        {
            'id': 'p_john01',
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john@email.com',
            'phone_no': '+15551111111',
            'date_of_birth': date(1990, 5, 15),
            'sex': 'M',
            'allergies_and_medication': 'No known allergies.',
            'about_note': 'Managing work stress and anxiety.',
            'tags': ['anxiety', 'work-stress'],
            'wallet_balance': Decimal('200.00')
        },
        {
            'id': 'p_sara02',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah@email.com',
            'phone_no': '+15552222222',
            'date_of_birth': date(1985, 8, 22),
            'sex': 'F',
            'allergies_and_medication': 'Taking sertraline 50mg.',
            'about_note': 'Working through depression.',
            'tags': ['depression', 'relationships'],
            'wallet_balance': Decimal('150.00')
        },
        {
            'id': 'p_mike03',
            'first_name': 'Mike',
            'last_name': 'Brown',
            'email': 'mike@email.com',
            'phone_no': '+15553333333',
            'date_of_birth': date(1978, 12, 3),
            'sex': 'M',
            'allergies_and_medication': 'No allergies.',
            'about_note': 'Improving communication skills.',
            'tags': ['anger', 'communication'],
            'wallet_balance': Decimal('300.00')
        },
        {
            'id': 'p_emily4',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'email': 'emily@email.com',
            'phone_no': '+15554444444',
            'date_of_birth': date(1992, 3, 18),
            'sex': 'F',
            'allergies_and_medication': 'No medications.',
            'about_note': 'Building confidence.',
            'tags': ['social-anxiety', 'self-esteem'],
            'wallet_balance': Decimal('175.00')
        },
        {
            'id': 'p_david5',
            'first_name': 'David',
            'last_name': 'Wilson',
            'email': 'david@email.com',
            'phone_no': '+15555555555',
            'date_of_birth': date(1988, 7, 9),
            'sex': 'M',
            'allergies_and_medication': 'Taking ADHD meds.',
            'about_note': 'Managing ADHD and focus.',
            'tags': ['adhd', 'focus'],
            'wallet_balance': Decimal('225.00')
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        patient_id = patient_data['id']
        
        # Check if patient exists
        if Patient.objects.filter(id=patient_id).exists():
            print(f'Patient {patient_id} already exists, skipping...')
            patient = Patient.objects.get(id=patient_id)
            created_patients.append(patient)
            continue
        
        try:
            patient = Patient.objects.create(
                password='12345678',
                address=f'{random.randint(100, 999)} Main St, Wellness City, CA 90210',
                **patient_data
            )
        except Exception as e:
            print(f'Error creating patient {patient_id}: {str(e)}')
            print(f'Patient data: {patient_data}')
            continue
        created_patients.append(patient)
        print(f'✅ Created patient: {patient.get_full_name()} ({patient.id})')
    
    return created_patients

def create_dashboard_sessions(therapist, patients):
    print('Creating sessions for dashboard...')
    
    created_sessions = []
    base_date = datetime.now()
    
    # Create sessions for current month and next month
    session_dates = []
    
    # Add some past sessions (completed)
    for i in range(8):
        days_ago = random.randint(1, 30)
        session_date = base_date - timedelta(days=days_ago)
        session_dates.append((session_date, 'completed'))
    
    # Add some future sessions (scheduled)
    for i in range(12):
        days_ahead = random.randint(1, 45)
        session_date = base_date + timedelta(days=days_ahead)
        session_dates.append((session_date, 'scheduled'))
    
    for session_date, status in session_dates:
        # Random patient
        patient = random.choice(patients)
        
        # Random time (business hours)
        hour = random.choice([9, 10, 11, 13, 14, 15, 16, 17])
        minute = random.choice([0, 30])
        session_datetime = session_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # Generate session ID
        date_str = session_datetime.strftime('%Y%m%d_%H%M')
        session_id = f'{therapist.id}_{patient.id}_{date_str}'
        
        # Skip if session already exists
        if Session.objects.filter(id=session_id).exists():
            continue
        
        # Random duration and fee
        duration = random.choice([45, 60, 90])
        fee = Decimal(str(random.randint(100, 150)))
        
        session = Session.objects.create(
            id=session_id,
            therapist_first_name=therapist.first_name,
            therapist_last_name=therapist.last_name,
            therapist_id=therapist.id,
            patient_first_name=patient.first_name,
            patient_last_name=patient.last_name,
            patient_id=patient.id,
            scheduled_start_datetime=session_datetime,
            payment_stat='successful' if status == 'completed' else 'pending',
            fee=fee,
            status=status,
            duration=duration,
            therapist_notes=f'Good progress with {patient.first_name}. Continuing with CBT techniques.' if status == 'completed' else None,
            patient_rating=Decimal(str(random.uniform(4.2, 5.0))) if status == 'completed' else None,
            patient_input=f'Feeling more confident and equipped with coping strategies.' if status == 'completed' else None
        )
        
        created_sessions.append(session)
        print(f'✅ Created session: {session_datetime.strftime(\"%Y-%m-%d %H:%M\")} with {patient.first_name} - {status}')
    
    return created_sessions

# Main execution
print('🏥 TherapyConnect Dashboard Data Generator (Docker)')
print('=' * 50)

try:
    # Create the dashboard therapist
    therapist = create_dashboard_therapist()
    
    # Create patients for the therapist
    patients = create_dashboard_patients(therapist)
    
    # Create sessions between therapist and patients
    sessions = create_dashboard_sessions(therapist, patients)
    
    print('')
    print('=' * 50)
    print('✅ Dashboard test data creation completed successfully!')
    print(f'📊 Summary:')
    print(f'   - Therapist: Dr. {therapist.get_full_name()} ({therapist.id})')
    print(f'   - Patients: {len(patients)}')
    print(f'   - Sessions: {len(sessions)}')
    print(f'')
    print(f'🎯 The therapist dashboard should now display real data!')
    print(f'   - Therapist ID used in frontend: {MOCK_THERAPIST_ID}')
    
except Exception as e:
    print(f'')
    print(f'❌ Error creating dashboard data: {str(e)}')
    import traceback
    traceback.print_exc()
    exit(1)
"

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
    echo "🚀 Your containers are running:"
    echo "   - Backend: http://localhost:8000"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Database: PostgreSQL in container"
    echo ""
    echo "📱 You can now view the therapist dashboard with real data!"
    echo ""
    echo "🛠️  Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop containers: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo ""
else
    echo "❌ Error: Test data creation failed"
    echo "   Check logs with: docker-compose logs backend"
    exit 1
fi
