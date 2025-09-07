#!/usr/bin/env python3
"""
Dashboard Test Data Generator for TherapyConnect

This script creates the specific test data needed to populate the therapist dashboard,
including the mock therapist ID used in the frontend.

Usage:
    python add_dashboard_data.py

Make sure Django environment is properly set up before running this script.
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from therapy.models import Patient, Therapist, Session, Payment

# Mock therapist ID used in the frontend
MOCK_THERAPIST_ID = "t_abc123"

def create_dashboard_therapist():
    """Create the specific therapist used in the dashboard"""
    print("Creating dashboard therapist...")
    
    # Check if therapist already exists
    if Therapist.objects.filter(id=MOCK_THERAPIST_ID).exists():
        print(f"Therapist {MOCK_THERAPIST_ID} already exists, updating...")
        therapist = Therapist.objects.get(id=MOCK_THERAPIST_ID)
        # Update with fresh data
        therapist.first_name = "Alice"
        therapist.last_name = "Smith"
        therapist.about_note = "I am a licensed therapist specializing in Cognitive Behavioral Therapy with over 15 years of experience."
        therapist.area_of_expertise = ["Cognitive Behavioral Therapy", "Stress Management", "Anxiety Disorders", "Depression"]
        therapist.wallet_balance = Decimal('1250.00')
        therapist.average_score = Decimal('4.8')
        therapist.save()
    else:
        therapist = Therapist.objects.create(
            id=MOCK_THERAPIST_ID,
            password='password123',
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
    
    print(f"✅ Created/Updated therapist: Dr. {therapist.get_full_name()} ({therapist.id})")
    return therapist

def create_dashboard_patients(therapist):
    """Create patients for the dashboard therapist"""
    print("Creating patients for dashboard...")
    
    patients_data = [
        {
            'id': 'p_john01',
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@email.com',
            'phone_no': '+15551111111',
            'date_of_birth': date(1990, 5, 15),
            'sex': 'M',
            'allergies_and_medication': 'No known allergies.',
            'about_note': 'Managing work-related stress and anxiety.',
            'tags': ['anxiety', 'work-stress', 'cbt'],
            'wallet_balance': Decimal('200.00')
        },
        {
            'id': 'p_sarah02',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@email.com',
            'phone_no': '+15552222222',
            'date_of_birth': date(1985, 8, 22),
            'sex': 'F',
            'allergies_and_medication': 'Taking sertraline 50mg.',
            'about_note': 'Working through depression and relationship challenges.',
            'tags': ['depression', 'relationships'],
            'wallet_balance': Decimal('150.00')
        },
        {
            'id': 'p_mike03',
            'first_name': 'Michael',
            'last_name': 'Brown',
            'email': 'michael.brown@email.com',
            'phone_no': '+15553333333',
            'date_of_birth': date(1978, 12, 3),
            'sex': 'M',
            'allergies_and_medication': 'No allergies.',
            'about_note': 'Improving communication and anger management.',
            'tags': ['anger-management', 'communication'],
            'wallet_balance': Decimal('300.00')
        },
        {
            'id': 'p_emily04',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'email': 'emily.davis@email.com',
            'phone_no': '+15554444444',
            'date_of_birth': date(1992, 3, 18),
            'sex': 'F',
            'allergies_and_medication': 'No current medications.',
            'about_note': 'Building confidence and managing social anxiety.',
            'tags': ['social-anxiety', 'self-esteem'],
            'wallet_balance': Decimal('175.00')
        },
        {
            'id': 'p_david05',
            'first_name': 'David',
            'last_name': 'Wilson',
            'email': 'david.wilson@email.com',
            'phone_no': '+15555555555',
            'date_of_birth': date(1988, 7, 9),
            'sex': 'M',
            'allergies_and_medication': 'Taking ADHD medication.',
            'about_note': 'Managing ADHD and improving workplace focus.',
            'tags': ['adhd', 'focus', 'productivity'],
            'wallet_balance': Decimal('225.00')
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        patient_id = patient_data['id']
        
        # Check if patient exists
        if Patient.objects.filter(id=patient_id).exists():
            print(f"Patient {patient_id} already exists, skipping...")
            patient = Patient.objects.get(id=patient_id)
            created_patients.append(patient)
            continue
        
        patient = Patient.objects.create(
            password='password123',
            address=f"{random.randint(100, 999)} Main St, Wellness City, CA 90210",
            **patient_data
        )
        created_patients.append(patient)
        print(f"✅ Created patient: {patient.get_full_name()} ({patient.id})")
    
    return created_patients

def create_dashboard_sessions(therapist, patients):
    """Create sessions for the dashboard"""
    print("Creating sessions for dashboard...")
    
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
        session_id = f"{therapist.id}_{patient.id}_{date_str}"
        
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
            therapist_notes=f"Good progress with {patient.first_name}. Continuing with CBT techniques." if status == 'completed' else None,
            patient_rating=Decimal(str(random.uniform(4.2, 5.0))) if status == 'completed' else None,
            patient_input=f"Feeling more confident and equipped with coping strategies." if status == 'completed' else None
        )
        
        created_sessions.append(session)
        print(f"✅ Created session: {session_datetime.strftime('%Y-%m-%d %H:%M')} with {patient.first_name} - {status}")
    
    return created_sessions

def main():
    """Main function to create dashboard-specific test data"""
    print("🏥 TherapyConnect Dashboard Data Generator")
    print("=" * 50)
    
    try:
        # Create the dashboard therapist
        therapist = create_dashboard_therapist()
        
        # Create patients for the therapist
        patients = create_dashboard_patients(therapist)
        
        # Create sessions between therapist and patients
        sessions = create_dashboard_sessions(therapist, patients)
        
        print("\n" + "=" * 50)
        print("✅ Dashboard test data creation completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Therapist: Dr. {therapist.get_full_name()} ({therapist.id})")
        print(f"   - Patients: {len(patients)}")
        print(f"   - Sessions: {len(sessions)}")
        print(f"\n🎯 The therapist dashboard should now display real data!")
        print(f"   - Therapist ID used in frontend: {MOCK_THERAPIST_ID}")
        
    except Exception as e:
        print(f"\n❌ Error creating dashboard data: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
