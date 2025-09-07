"""
Custom JWT Authentication for TherapyConnect

This module provides custom JWT authentication that works with our Therapist model
instead of the default Django User model.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from .models import Therapist


class TherapistJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that uses Therapist model instead of User model
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a therapist using the given validated token.
        """
        try:
            therapist_id = validated_token.get('therapist_id')
            if not therapist_id:
                return None
            
            therapist = Therapist.objects.get(id=therapist_id)
            
            # Create a user-like object that DRF expects
            # This allows our Therapist to work with DRF's permission system
            therapist.is_authenticated = True
            therapist.is_anonymous = False
            therapist.is_active = True
            
            return therapist
            
        except Therapist.DoesNotExist:
            return None
        except (KeyError, TypeError):
            return None


class AnonymousTherapist(AnonymousUser):
    """
    Anonymous user class for therapists
    """
    def __init__(self):
        super().__init__()
        self.is_authenticated = False
        self.is_anonymous = True
        self.is_active = False
