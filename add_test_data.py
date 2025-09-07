#!/usr/bin/env python3
"""
Test Data Generator for TherapyConnect

This script adds comprehensive test data for patients, therapists, sessions, and payments
to the TherapyConnect database.

Usage:
    python add_test_data.py

Make sure Django environment is properly set up before running this script.
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random
import string

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from therapy.models import Patient, Therapist, Session, Payment

def generate_random_id(prefix, length=6):
    """Generate random ID with given prefix"""
    chars = string.ascii_lowercase + string.digits
    random_part = ''.join(random.choice(chars) for _ in range(length))
    return f"{prefix}_{random_part}"

def generate_phone():
    """Generate a random phone number"""
    return f"+1{random.randint(2000000000, 9999999999)}"

def generate_ssn():
    """Generate a random SSN"""
    return f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"

def create_test_patients():
    """Create test patients"""
    print("Creating test patients...")
    
    patients_data = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@email.com',
            'date_of_birth': date(1990, 5, 15),
            'sex': 'M',
            'allergies_and_medication': 'No known allergies. Taking vitamin D supplements.',
            'about_note': 'Looking to manage stress and anxiety from work.',
            'tags': ['anxiety', 'work-stress'],
            'wallet_balance': Decimal('150.00')
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@email.com',
            'date_of_birth': date(1985, 8, 22),
            'sex': 'F',
            'allergies_and_medication': 'Allergic to penicillin. Currently taking sertraline 50mg.',
            'about_note': 'Dealing with depression and relationship issues.',
            'tags': ['depression', 'relationships'],
            'wallet_balance': Decimal('200.00')
        },
        {
            'first_name': 'Michael',
            'last_name': 'Brown',
            'email': 'michael.brown@email.com',
            'date_of_birth': date(1978, 12, 3),
            'sex': 'M',
            'allergies_and_medication': 'No allergies. Taking blood pressure medication.',
            'about_note': 'Seeking help with anger management and communication skills.',
            'tags': ['anger-management', 'communication'],
            'wallet_balance': Decimal('300.00')
        },
        {
            'first_name': 'Emily',
            'last_name': 'Davis',
            'email': 'emily.davis@email.com',
            'date_of_birth': date(1992, 3, 18),
            'sex': 'F',
            'allergies_and_medication': 'Lactose intolerant. No current medications.',
            'about_note': 'Struggling with social anxiety and self-esteem issues.',
            'tags': ['social-anxiety', 'self-esteem'],
            'wallet_balance': Decimal('120.00')
        },
        {
            'first_name': 'David',
            'last_name': 'Wilson',
            'email': 'david.wilson@email.com',
            'date_of_birth': date(1988, 7, 9),
            'sex': 'M',
            'allergies_and_medication': 'Allergic to shellfish. Taking ADHD medication.',
            'about_note': 'Managing ADHD and improving focus at work.',
            'tags': ['adhd', 'focus', 'productivity'],
            'wallet_balance': Decimal('250.00')
        },
        {
            'first_name': 'Jessica',
            'last_name': 'Miller',
            'email': 'jessica.miller@email.com',
            'date_of_birth': date(1995, 11, 27),
            'sex': 'F',
            'allergies_and_medication': 'No known allergies. Taking birth control.',
            'about_note': 'Dealing with grief and loss after family tragedy.',
            'tags': ['grief', 'loss', 'family'],
            'wallet_balance': Decimal('180.00')
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        # Generate unique ID and phone
        patient_id = generate_random_id('p')
        phone = generate_phone()
        
        # Ensure uniqueness
        while Patient.objects.filter(id=patient_id).exists():
            patient_id = generate_random_id('p')
        while Patient.objects.filter(phone_no=phone).exists():
            phone = generate_phone()
        
        patient = Patient.objects.create(
            id=patient_id,
            password='password123',  # In production, this would be hashed
            phone_no=phone,
            address=f"{random.randint(100, 9999)} Main St, City, State {random.randint(10000, 99999)}",
            **patient_data
        )
        created_patients.append(patient)
        print(f"Created patient: {patient.get_full_name()} ({patient.id})")
    
    return created_patients

def create_test_therapists():
    """Create test therapists"""
    print("\nCreating test therapists...")
    
    therapists_data = [
        {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice.smith@therapyconnect.com',
            'date_of_birth': date(1975, 4, 12),
            'sex': 'F',
            'education': [
                'PhD in Clinical Psychology - Harvard University',
                'MA in Counseling Psychology - Stanford University'
            ],
            'area_of_expertise': ['Cognitive Behavioral Therapy', 'Anxiety Disorders', 'Depression'],
            'about_note': 'Specializing in CBT with 15+ years of experience helping clients overcome anxiety and depression.',
            'years_active': 15,
            'verified_certificates': ['Licensed Clinical Psychologist', 'CBT Certification'],
            'average_score': Decimal('4.8'),
            'wallet_balance': Decimal('2500.00')
        },
        {
            'first_name': 'Robert',
            'last_name': 'Johnson',
            'email': 'robert.johnson@therapyconnect.com',
            'date_of_birth': date(1968, 9, 8),
            'sex': 'M',
            'education': [
                'PhD in Psychology - Yale University',
                'MA in Marriage and Family Therapy - UCLA'
            ],
            'area_of_expertise': ['Family Therapy', 'Relationship Counseling', 'Trauma Recovery'],
            'about_note': 'Expert in family systems therapy with a focus on healing relationships and trauma recovery.',
            'years_active': 20,
            'verified_certificates': ['Licensed Marriage and Family Therapist', 'Trauma Specialist'],
            'average_score': Decimal('4.9'),
            'wallet_balance': Decimal('3200.00')
        },
        {
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'email': 'maria.garcia@therapyconnect.com',
            'date_of_birth': date(1982, 6, 15),
            'sex': 'F',
            'education': [
                'PsyD in Clinical Psychology - Pepperdine University',
                'MA in Counseling - University of Southern California'
            ],
            'area_of_expertise': ['ADHD Treatment', 'Child Psychology', 'Behavioral Therapy'],
            'about_note': 'Specialized in working with children and adults with ADHD, using evidence-based behavioral interventions.',
            'years_active': 8,
            'verified_certificates': ['Licensed Clinical Psychologist', 'ADHD Specialist'],
            'average_score': Decimal('4.7'),
            'wallet_balance': Decimal('1800.00')
        },
        {
            'first_name': 'James',
            'last_name': 'Wilson',
            'email': 'james.wilson@therapyconnect.com',
            'date_of_birth': date(1970, 12, 22),
            'sex': 'M',
            'education': [
                'PhD in Counseling Psychology - University of Michigan',
                'MA in Social Work - University of Chicago'
            ],
            'area_of_expertise': ['Grief Counseling', 'Loss and Bereavement', 'Support Groups'],
            'about_note': 'Compassionate therapist specializing in grief counseling and helping clients navigate loss and major life transitions.',
            'years_active': 18,
            'verified_certificates': ['Licensed Clinical Social Worker', 'Grief Counseling Certification'],
            'average_score': Decimal('4.6'),
            'wallet_balance': Decimal('2100.00')
        }
    ]
    
    created_therapists = []
    for therapist_data in therapists_data:
        # Generate unique ID, phone, and SSN
        therapist_id = generate_random_id('t')
        phone = generate_phone()
        ssn = generate_ssn()
        
        # Ensure uniqueness
        while Therapist.objects.filter(id=therapist_id).exists():
            therapist_id = generate_random_id('t')
        while Therapist.objects.filter(phone_no=phone).exists():
            phone = generate_phone()
        while Therapist.objects.filter(ssn=ssn).exists():
            ssn = generate_ssn()
        
        therapist = Therapist.objects.create(
            id=therapist_id,
            password='password123',  # In production, this would be hashed
            phone_no=phone,
            ssn=ssn,
            house_addr=f"{random.randint(100, 9999)} Oak Avenue, City, State {random.randint(10000, 99999)}",
            work_addr=f"{random.randint(100, 9999)} Professional Blvd, Suite {random.randint(100, 999)}, City, State {random.randint(10000, 99999)}",
            **therapist_data
        )
        created_therapists.append(therapist)
        print(f"Created therapist: Dr. {therapist.get_full_name()} ({therapist.id})")
    
    return created_therapists

def create_test_sessions(patients, therapists):
    """Create test sessions between patients and therapists"""
    print("\nCreating test sessions...")
    
    created_sessions = []
    session_statuses = ['scheduled', 'completed', 'cancelled']
    
    # Create sessions for the next 30 days and past 30 days
    base_date = datetime.now()
    
    for i in range(20):  # Create 20 sessions
        # Random patient and therapist
        patient = random.choice(patients)
        therapist = random.choice(therapists)
        
        # Random date within -30 to +30 days
        days_offset = random.randint(-30, 30)
        session_date = base_date + timedelta(days=days_offset)
        
        # Random time (business hours)
        hour = random.randint(9, 17)
        minute = random.choice([0, 30])
        session_datetime = session_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # Generate session ID
        date_str = session_datetime.strftime('%Y%m%d_%H%M')
        session_id = f"{therapist.id}_{patient.id}_{date_str}"
        
        # Skip if session already exists
        if Session.objects.filter(id=session_id).exists():
            continue
        
        # Determine status based on date
        if session_datetime < datetime.now():
            status = random.choice(['completed', 'cancelled'])
        else:
            status = 'scheduled'
        
        # Random duration and fee
        duration = random.choice([45, 60, 90])
        fee = Decimal(str(random.randint(80, 150)))
        
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
            therapist_notes=f"Session notes for {patient.first_name} - {random.choice(['Good progress', 'Needs follow-up', 'Exploring new techniques', 'Working on goals'])}" if status == 'completed' else None,
            patient_rating=Decimal(str(random.uniform(4.0, 5.0))) if status == 'completed' else None,
            patient_input=f"Feeling {random.choice(['better', 'more confident', 'hopeful', 'supported'])} after this session." if status == 'completed' else None
        )
        
        created_sessions.append(session)
        print(f"Created session: {session.id} - {session.status}")
    
    return created_sessions

def create_test_payments(sessions):
    """Create test payments for sessions"""
    print("\nCreating test payments...")
    
    created_payments = []
    
    for session in sessions:
        # Only create payments for completed sessions
        if session.status != 'completed':
            continue
        
        # Generate payment ID
        date_str = session.scheduled_start_datetime.strftime('%Y%m%d')
        random_suffix = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        payment_id = f"PAY_{date_str}_{random_suffix}"
        
        # Skip if payment already exists
        if Payment.objects.filter(id=payment_id).exists():
            continue
        
        payment = Payment.objects.create(
            id=payment_id,
            session_id=session.id,
            therapist_first_name=session.therapist_first_name,
            therapist_last_name=session.therapist_last_name,
            therapist_id=session.therapist_id,
            patient_first_name=session.patient_first_name,
            patient_last_name=session.patient_last_name,
            patient_id=session.patient_id,
            stat='successful',
            fee=session.fee
        )
        
        created_payments.append(payment)
        print(f"Created payment: {payment.id} - ${payment.fee}")
    
    return created_payments

def main():
    """Main function to create all test data"""
    print("🏥 TherapyConnect Test Data Generator")
    print("=" * 50)
    
    try:
        # Create test patients
        patients = create_test_patients()
        
        # Create test therapists  
        therapists = create_test_therapists()
        
        # Create test sessions
        sessions = create_test_sessions(patients, therapists)
        
        # Create test payments
        payments = create_test_payments(sessions)
        
        print("\n" + "=" * 50)
        print("✅ Test data creation completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Patients: {len(patients)}")
        print(f"   - Therapists: {len(therapists)}")
        print(f"   - Sessions: {len(sessions)}")
        print(f"   - Payments: {len(payments)}")
        print("\n🎯 You can now test the therapist dashboard with real data!")
        
    except Exception as e:
        print(f"\n❌ Error creating test data: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
