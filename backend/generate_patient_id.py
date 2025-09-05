#!/usr/bin/env python3
"""
Utility script to generate valid patient IDs for the TherapyConnect application.

Patient ID format: p_xxxxxx where x is lowercase alphanumeric (a-z, 0-9)
"""

import random
import string
import re

def generate_patient_id():
    """
    Generate a random patient ID in the format p_xxxxxx
    
    Returns:
        str: A valid patient ID
    """
    # Generate 6 random lowercase alphanumeric characters
    chars = string.ascii_lowercase + string.digits
    random_chars = ''.join(random.choice(chars) for _ in range(6))
    
    # Format as p_xxxxxx
    patient_id = f"p_{random_chars}"
    
    return patient_id

def validate_patient_id(patient_id):
    """
    Validate if a patient ID follows the correct format
    
    Args:
        patient_id (str): The patient ID to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r'^p_[a-z0-9]{6}$'
    return bool(re.match(pattern, patient_id))

def generate_multiple_ids(count=10):
    """
    Generate multiple patient IDs
    
    Args:
        count (int): Number of IDs to generate
        
    Returns:
        list: List of valid patient IDs
    """
    ids = []
    for _ in range(count):
        patient_id = generate_patient_id()
        ids.append(patient_id)
    
    return ids

def main():
    """Main function to demonstrate the utility"""
    print("TherapyConnect Patient ID Generator")
    print("=" * 40)
    
    # Generate a single ID
    single_id = generate_patient_id()
    print(f"Single ID: {single_id}")
    print(f"Valid: {validate_patient_id(single_id)}")
    print()
    
    # Generate multiple IDs
    multiple_ids = generate_multiple_ids(5)
    print("Multiple IDs:")
    for i, patient_id in enumerate(multiple_ids, 1):
        print(f"  {i}. {patient_id} (Valid: {validate_patient_id(patient_id)})")
    print()
    
    # Test validation with various formats
    test_ids = [
        "p_abc123",    # Valid
        "p_123abc",    # Valid
        "p_abcdef",    # Valid
        "abc123",      # Invalid - missing p_
        "p_ABC123",    # Invalid - uppercase letters
        "p_123",       # Invalid - too short
        "p_1234567",   # Invalid - too long
        "patient_123", # Invalid - wrong format
    ]
    
    print("Validation Tests:")
    for test_id in test_ids:
        is_valid = validate_patient_id(test_id)
        status = "✓" if is_valid else "✗"
        print(f"  {status} {test_id}")

if __name__ == "__main__":
    main()
