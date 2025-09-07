#!/usr/bin/env python3
"""
Therapist Data Extraction Script for TherapyConnect

This script provides multiple methods to extract data from the therapist table
in your Docker container environment.

Usage:
    python extract_therapist_data.py [options]

Options:
    --method [django|sql|json]    Extraction method (default: django)
    --output [console|file|csv]   Output format (default: console)
    --filter [field=value]        Filter results (e.g., --filter id=t_abc123)
    --export [filename]           Export to file

Examples:
    python extract_therapist_data.py
    python extract_therapist_data.py --method json --output file
    python extract_therapist_data.py --filter id=t_abc123 --export therapist.json
"""

import os
import sys
import django
import json
import csv
import argparse
from datetime import datetime
from decimal import Decimal

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models after Django setup
from therapy.models import Therapist, Session, Patient, Review
from django.db import connection

class TherapistDataExtractor:
    def __init__(self):
        self.output_methods = {
            'console': self.print_to_console,
            'file': self.save_to_file,
            'csv': self.save_to_csv
        }
    
    def extract_with_django_orm(self, filters=None):
        """Extract therapist data using Django ORM"""
        print("🔍 Extracting therapist data using Django ORM...")
        
        # Start with all therapists
        queryset = Therapist.objects.all()
        
        # Apply filters if provided
        if filters:
            for field, value in filters.items():
                filter_dict = {field: value}
                queryset = queryset.filter(**filter_dict)
        
        therapists_data = []
        for therapist in queryset:
            # Get related data
            sessions = Session.objects.filter(therapist_id=therapist.id)
            patients = Patient.objects.filter(
                id__in=sessions.values_list('patient_id', flat=True)
            ).distinct()
            reviews = Review.objects.filter(therapist_id=therapist.id)
            
            therapist_data = {
                'id': therapist.id,
                'personal_info': {
                    'first_name': therapist.first_name,
                    'last_name': therapist.last_name,
                    'full_name': therapist.get_full_name(),
                    'email': therapist.email,
                    'phone_no': therapist.phone_no,
                    'date_of_birth': therapist.date_of_birth.isoformat(),
                    'age': therapist.get_age(),
                    'sex': therapist.get_sex_display(),
                },
                'professional_info': {
                    'ssn': therapist.ssn,
                    'years_active': therapist.years_active,
                    'education': therapist.education,
                    'verified_certificates': therapist.verified_certificates,
                    'area_of_expertise': therapist.area_of_expertise,
                    'about_note': therapist.about_note,
                    'average_score': float(therapist.average_score) if therapist.average_score else 0.0,
                },
                'addresses': {
                    'house_addr': therapist.house_addr,
                    'work_addr': therapist.work_addr,
                },
                'financial_info': {
                    'wallet_balance': float(therapist.wallet_balance),
                    'no_payment': therapist.no_payment,
                    'no_payment_patients': therapist.no_payment_patients,
                },
                'settings': {
                    'receive_emergency_messages': therapist.receive_emergency_messages,
                    'can_send_emergency_messages': therapist.can_send_emergency_messages,
                },
                'statistics': {
                    'total_sessions': sessions.count(),
                    'completed_sessions': sessions.filter(status='completed').count(),
                    'scheduled_sessions': sessions.filter(status='scheduled').count(),
                    'cancelled_sessions': sessions.filter(status='cancelled').count(),
                    'unique_patients': patients.count(),
                    'total_reviews': reviews.count(),
                    'average_rating': float(reviews.aggregate(
                        avg_score=django.db.models.Avg('score')
                    )['avg_score'] or 0),
                },
                'timestamps': {
                    'created_at': therapist.created_at.isoformat(),
                    'updated_at': therapist.updated_at.isoformat(),
                }
            }
            therapists_data.append(therapist_data)
        
        return therapists_data
    
    def extract_with_raw_sql(self, filters=None):
        """Extract therapist data using raw SQL queries"""
        print("🔍 Extracting therapist data using raw SQL...")
        
        # Base SQL query
        sql = """
        SELECT 
            t.*,
            COUNT(DISTINCT s.id) as total_sessions,
            COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
            COUNT(DISTINCT CASE WHEN s.status = 'scheduled' THEN s.id END) as scheduled_sessions,
            COUNT(DISTINCT s.patient_id) as unique_patients,
            COUNT(DISTINCT r.id) as total_reviews,
            AVG(r.score) as avg_review_score
        FROM therapists t
        LEFT JOIN sessions s ON t.id = s.therapist_id
        LEFT JOIN reviews r ON t.id = r.therapist_id
        """
        
        params = []
        if filters:
            where_clauses = []
            for field, value in filters.items():
                where_clauses.append(f"t.{field} = %s")
                params.append(value)
            sql += " WHERE " + " AND ".join(where_clauses)
        
        sql += " GROUP BY t.id ORDER BY t.created_at DESC"
        
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            results = []
            for row in cursor.fetchall():
                result = dict(zip(columns, row))
                # Convert decimal fields to float for JSON serialization
                for key, value in result.items():
                    if isinstance(value, Decimal):
                        result[key] = float(value)
                    elif hasattr(value, 'isoformat'):  # datetime objects
                        result[key] = value.isoformat()
                results.append(result)
        
        return results
    
    def get_therapist_summary(self):
        """Get a summary of all therapists"""
        total_therapists = Therapist.objects.count()
        active_therapists = Therapist.objects.filter(
            id__in=Session.objects.filter(
                status='scheduled',
                scheduled_start_datetime__gte=datetime.now()
            ).values_list('therapist_id', flat=True)
        ).distinct().count()
        
        summary = {
            'total_therapists': total_therapists,
            'active_therapists': active_therapists,
            'therapist_ids': list(Therapist.objects.values_list('id', flat=True)),
            'specialties': [],
            'average_experience': 0
        }
        
        # Get all unique specialties
        all_specialties = set()
        total_experience = 0
        for therapist in Therapist.objects.all():
            if therapist.area_of_expertise:
                all_specialties.update(therapist.area_of_expertise)
            total_experience += therapist.years_active
        
        summary['specialties'] = list(all_specialties)
        summary['average_experience'] = total_experience / total_therapists if total_therapists > 0 else 0
        
        return summary
    
    def print_to_console(self, data, filename=None):
        """Print data to console in a readable format"""
        if isinstance(data, list):
            for i, item in enumerate(data):
                print(f"\n{'='*60}")
                print(f"THERAPIST #{i+1}")
                print(f"{'='*60}")
                self._print_therapist_details(item)
        else:
            self._print_therapist_details(data)
    
    def _print_therapist_details(self, therapist_data):
        """Print individual therapist details"""
        if 'personal_info' in therapist_data:
            # Django ORM format
            print(f"ID: {therapist_data['id']}")
            print(f"Name: {therapist_data['personal_info']['full_name']}")
            print(f"Email: {therapist_data['personal_info']['email']}")
            print(f"Phone: {therapist_data['personal_info']['phone_no']}")
            print(f"Age: {therapist_data['personal_info']['age']}")
            print(f"Experience: {therapist_data['professional_info']['years_active']} years")
            print(f"Specialties: {', '.join(therapist_data['professional_info']['area_of_expertise'])}")
            print(f"Rating: {therapist_data['professional_info']['average_score']}/10")
            print(f"Wallet Balance: ${therapist_data['financial_info']['wallet_balance']}")
            print(f"Total Sessions: {therapist_data['statistics']['total_sessions']}")
            print(f"Patients: {therapist_data['statistics']['unique_patients']}")
        else:
            # Raw SQL format
            print(f"ID: {therapist_data.get('id', 'N/A')}")
            print(f"Name: {therapist_data.get('first_name', '')} {therapist_data.get('last_name', '')}")
            print(f"Email: {therapist_data.get('email', 'N/A')}")
            print(f"Phone: {therapist_data.get('phone_no', 'N/A')}")
            print(f"Experience: {therapist_data.get('years_active', 0)} years")
            print(f"Rating: {therapist_data.get('average_score', 0)}/10")
            print(f"Wallet Balance: ${therapist_data.get('wallet_balance', 0)}")
            print(f"Total Sessions: {therapist_data.get('total_sessions', 0)}")
            print(f"Patients: {therapist_data.get('unique_patients', 0)}")
    
    def save_to_file(self, data, filename=None):
        """Save data to JSON file"""
        if not filename:
            filename = f"therapist_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Custom JSON encoder for Decimal and datetime objects
        class CustomJSONEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, Decimal):
                    return float(obj)
                elif hasattr(obj, 'isoformat'):
                    return obj.isoformat()
                return super().default(obj)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, cls=CustomJSONEncoder, ensure_ascii=False)
        
        print(f"✅ Data saved to {filename}")
        return filename
    
    def save_to_csv(self, data, filename=None):
        """Save data to CSV file"""
        if not filename:
            filename = f"therapist_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        if not data:
            print("❌ No data to export")
            return
        
        # Flatten the data for CSV export
        flattened_data = []
        for item in data:
            if 'personal_info' in item:
                # Django ORM format - flatten nested dictionaries
                flat_item = {
                    'id': item['id'],
                    'first_name': item['personal_info']['first_name'],
                    'last_name': item['personal_info']['last_name'],
                    'email': item['personal_info']['email'],
                    'phone_no': item['personal_info']['phone_no'],
                    'age': item['personal_info']['age'],
                    'sex': item['personal_info']['sex'],
                    'years_active': item['professional_info']['years_active'],
                    'average_score': item['professional_info']['average_score'],
                    'wallet_balance': item['financial_info']['wallet_balance'],
                    'total_sessions': item['statistics']['total_sessions'],
                    'completed_sessions': item['statistics']['completed_sessions'],
                    'unique_patients': item['statistics']['unique_patients'],
                    'specialties': ', '.join(item['professional_info']['area_of_expertise']),
                    'created_at': item['timestamps']['created_at'],
                }
            else:
                # Raw SQL format - already flat
                flat_item = item
            
            flattened_data.append(flat_item)
        
        # Write to CSV
        if flattened_data:
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=flattened_data[0].keys())
                writer.writeheader()
                writer.writerows(flattened_data)
            
            print(f"✅ Data saved to {filename}")
            return filename

def parse_filters(filter_strings):
    """Parse filter strings into dictionary"""
    filters = {}
    if filter_strings:
        for filter_str in filter_strings:
            if '=' in filter_str:
                key, value = filter_str.split('=', 1)
                filters[key.strip()] = value.strip()
    return filters

def main():
    parser = argparse.ArgumentParser(description='Extract therapist data from TherapyConnect database')
    parser.add_argument('--method', choices=['django', 'sql', 'summary'], default='django',
                       help='Data extraction method')
    parser.add_argument('--output', choices=['console', 'file', 'csv'], default='console',
                       help='Output format')
    parser.add_argument('--filter', action='append', 
                       help='Filter results (format: field=value)')
    parser.add_argument('--export', 
                       help='Export filename (optional)')
    
    args = parser.parse_args()
    
    extractor = TherapistDataExtractor()
    
    try:
        print("🏥 TherapyConnect Therapist Data Extractor")
        print("=" * 50)
        
        # Parse filters
        filters = parse_filters(args.filter)
        if filters:
            print(f"📋 Applying filters: {filters}")
        
        # Extract data based on method
        if args.method == 'django':
            data = extractor.extract_with_django_orm(filters)
        elif args.method == 'sql':
            data = extractor.extract_with_raw_sql(filters)
        elif args.method == 'summary':
            data = extractor.get_therapist_summary()
        
        if not data:
            print("❌ No therapist data found with the specified filters")
            return
        
        print(f"✅ Found {len(data) if isinstance(data, list) else 1} therapist(s)")
        
        # Output data
        output_method = extractor.output_methods[args.output]
        output_method(data, args.export)
        
    except Exception as e:
        print(f"❌ Error extracting data: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
