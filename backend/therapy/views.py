from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Patient, Therapist, Session, Payment, Chat, Message, Review, Notebook, Page, Availability, ChatRoom
from .serializers import (
    PatientSerializer, PatientListSerializer, TherapistSerializer, TherapistListSerializer,
    SessionSerializer, SessionListSerializer, PaymentSerializer, PaymentListSerializer,
    ChatSerializer, ChatListSerializer, ChatDetailSerializer, MessageSerializer, MessageListSerializer, MessageCreateSerializer,
    ReviewSerializer, ReviewListSerializer, NotebookSerializer, NotebookListSerializer,
    PageSerializer, PageListSerializer, AvailabilitySerializer, AvailabilityListSerializer,
    ChatRoomSerializer, ChatRoomListSerializer
)

class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Patient model providing CRUD operations
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return PatientListSerializer
        return PatientSerializer
    
    def list(self, request, *args, **kwargs):
        """List all patients with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by name if provided
        name = request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(
                first_name__icontains=name
            ) | queryset.filter(
                last_name__icontains=name
            )
        
        # Filter by phone number if provided
        phone = request.query_params.get('phone', None)
        if phone:
            queryset = queryset.filter(phone_no__icontains=phone)
        
        # Filter by email if provided
        email = request.query_params.get('email', None)
        if email:
            queryset = queryset.filter(email__icontains=email)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new patient"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve a specific patient by ID"""
        patient = get_object_or_404(Patient, pk=pk)
        serializer = self.get_serializer(patient)
        return Response(serializer.data)
    
    def update(self, request, pk=None, *args, **kwargs):
        """Update a patient (full update)"""
        patient = get_object_or_404(Patient, pk=pk)
        serializer = self.get_serializer(patient, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def partial_update(self, request, pk=None, *args, **kwargs):
        """Update a patient (partial update)"""
        patient = get_object_or_404(Patient, pk=pk)
        serializer = self.get_serializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, pk=None, *args, **kwargs):
        """Delete a patient"""
        patient = get_object_or_404(Patient, pk=pk)
        patient.delete()
        return Response(
            {"message": "Patient deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    def add_tag(self, request, pk=None):
        """Add a tag to a patient"""
        patient = get_object_or_404(Patient, pk=pk)
        tag = request.data.get('tag')
        
        if not tag:
            return Response(
                {"error": "Tag is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if tag not in patient.tags:
            patient.tags.append(tag)
            patient.save()
            return Response(
                {"message": f"Tag '{tag}' added successfully"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": f"Tag '{tag}' already exists"},
                status=status.HTTP_200_OK
            )
    
    @action(detail=True, methods=['post'])
    def remove_tag(self, request, pk=None):
        """Remove a tag from a patient"""
        patient = get_object_or_404(Patient, pk=pk)
        tag = request.data.get('tag')
        
        if not tag:
            return Response(
                {"error": "Tag is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if tag in patient.tags:
            patient.tags.remove(tag)
            patient.save()
            return Response(
                {"message": f"Tag '{tag}' removed successfully"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": f"Tag '{tag}' not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Removed: add_session; Patient no longer stores sessions list
    
    @action(detail=True, methods=['post'])
    def update_wallet(self, request, pk=None):
        """Update patient's wallet balance"""
        patient = get_object_or_404(Patient, pk=pk)
        amount = request.data.get('amount')
        operation = request.data.get('operation', 'add')  # 'add' or 'subtract'
        
        if amount is None:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "Amount must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if operation == 'subtract':
            if patient.wallet_balance < amount:
                return Response(
                    {"error": "Insufficient wallet balance"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            patient.wallet_balance -= amount
        else:
            patient.wallet_balance += amount
        
        patient.save()
        return Response({
            "message": f"Wallet updated successfully. New balance: {patient.wallet_balance}",
            "new_balance": patient.wallet_balance
        })

class TherapistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Therapist model providing CRUD operations
    """
    queryset = Therapist.objects.all()
    serializer_class = TherapistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return TherapistListSerializer
        return TherapistSerializer
    
    def list(self, request, *args, **kwargs):
        """List all therapists with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by name if provided
        name = request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(
                first_name__icontains=name
            ) | queryset.filter(
                last_name__icontains=name
            )
        
        # Filter by phone number if provided
        phone = request.query_params.get('phone', None)
        if phone:
            queryset = queryset.filter(phone_no__icontains=phone)
        
        # Filter by email if provided
        email = request.query_params.get('email', None)
        if email:
            queryset = queryset.filter(email__icontains=email)
        
        # Filter by area of expertise if provided
        expertise = request.query_params.get('expertise', None)
        if expertise:
            queryset = queryset.filter(area_of_expertise__contains=[expertise])
        
        # Removed: availability filter; use Availability endpoints
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new therapist"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve a specific therapist by ID"""
        therapist = get_object_or_404(Therapist, pk=pk)
        serializer = self.get_serializer(therapist)
        return Response(serializer.data)
    
    def update(self, request, pk=None, *args, **kwargs):
        """Update a therapist (full update)"""
        therapist = get_object_or_404(Therapist, pk=pk)
        serializer = self.get_serializer(therapist, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def partial_update(self, request, pk=None, *args, **kwargs):
        """Update a therapist (partial update)"""
        therapist = get_object_or_404(Therapist, pk=pk)
        serializer = self.get_serializer(therapist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, pk=None, *args, **kwargs):
        """Delete a therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        therapist.delete()
        return Response(
            {"message": "Therapist deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    def add_certificate(self, request, pk=None):
        """Add a verified certificate to a therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        certificate = request.data.get('certificate')
        
        if not certificate:
            return Response(
                {"error": "Certificate is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if certificate not in therapist.verified_certificates:
            therapist.verified_certificates.append(certificate)
            therapist.save()
            return Response(
                {"message": f"Certificate '{certificate}' added successfully"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": f"Certificate '{certificate}' already exists"},
                status=status.HTTP_200_OK
            )
    
    @action(detail=True, methods=['post'])
    def add_expertise(self, request, pk=None):
        """Add an area of expertise to a therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        expertise = request.data.get('expertise')
        
        if not expertise:
            return Response(
                {"error": "Expertise is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if expertise not in therapist.area_of_expertise:
            therapist.area_of_expertise.append(expertise)
            therapist.save()
            return Response(
                {"message": f"Expertise '{expertise}' added successfully"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": f"Expertise '{expertise}' already exists"},
                status=status.HTTP_200_OK
            )
    
    # Removed: add_availability; Availability has a dedicated ViewSet
    
    @action(detail=True, methods=['post'])
    def update_score(self, request, pk=None):
        """Update therapist's average score"""
        therapist = get_object_or_404(Therapist, pk=pk)
        score = request.data.get('score')
        
        if score is None:
            return Response(
                {"error": "Score is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            score = float(score)
            if score < 0 or score > 5:
                return Response(
                    {"error": "Score must be between 0 and 5"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Score must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        therapist.average_score = score
        therapist.save()
        return Response({
            "message": f"Score updated successfully. New score: {therapist.average_score}",
            "new_score": therapist.average_score
        })
    
    @action(detail=True, methods=['post'])
    def update_wallet(self, request, pk=None):
        """Update therapist's wallet balance"""
        therapist = get_object_or_404(Therapist, pk=pk)
        amount = request.data.get('amount')
        operation = request.data.get('operation', 'add')  # 'add' or 'subtract'
        
        if amount is None:
            return Response(
                {"error": "Amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "Amount must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if operation == 'subtract':
            if therapist.wallet_balance < amount:
                return Response(
                    {"error": "Insufficient wallet balance"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            therapist.wallet_balance -= amount
        else:
            therapist.wallet_balance += amount
        
        therapist.save()
        return Response({
            "message": f"Wallet updated successfully. New balance: {therapist.wallet_balance}",
            "new_balance": therapist.wallet_balance
        })
    
    @action(detail=True, methods=['post'])
    def toggle_no_payment(self, request, pk=None):
        """Toggle no payment status for a therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        therapist.no_payment = not therapist.no_payment
        
        if not therapist.no_payment:
            therapist.no_payment_patients = []
        
        therapist.save()
        return Response({
            "message": f"No payment status updated. Current status: {therapist.no_payment}",
            "no_payment": therapist.no_payment
        })
    
    @action(detail=True, methods=['post'])
    def toggle_emergency_messages(self, request, pk=None):
        """Toggle emergency messages status for a therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        therapist.receive_emergency_messages = not therapist.receive_emergency_messages
        
        if not therapist.receive_emergency_messages:
            therapist.can_send_emergency_messages = []
        
        therapist.save()
        return Response({
            "message": f"Emergency messages status updated. Current status: {therapist.receive_emergency_messages}",
            "receive_emergency_messages": therapist.receive_emergency_messages
        })
    
    @action(detail=True, methods=['get'])
    def patients(self, request, pk=None):
        """Get list of patients for this therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        
        # Get all unique patient IDs that have sessions with this therapist
        patient_ids = Session.objects.filter(
            therapist_id=therapist.id
        ).values_list('patient_id', flat=True).distinct()
        
        # Get patient details
        patients = Patient.objects.filter(id__in=patient_ids)
        
        # Create simplified patient data for the dashboard
        patient_data = []
        for patient in patients:
            # Get latest session with this patient
            latest_session = Session.objects.filter(
                therapist_id=therapist.id,
                patient_id=patient.id
            ).order_by('-scheduled_start_datetime').first()
            
            # Get session count
            session_count = Session.objects.filter(
                therapist_id=therapist.id,
                patient_id=patient.id
            ).count()
            
            patient_data.append({
                'id': patient.id,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'full_name': patient.get_full_name(),
                'profile_picture': patient.profile_picture.url if patient.profile_picture else None,
                'last_session_date': latest_session.scheduled_start_datetime if latest_session else None,
                'session_count': session_count,
                'tags': patient.tags
            })
        
        return Response(patient_data)
    
    @action(detail=True, methods=['get'])
    def calendar_sessions(self, request, pk=None):
        """Get calendar view of sessions for this therapist"""
        therapist = get_object_or_404(Therapist, pk=pk)
        
        # Get year and month from query parameters, default to current
        from datetime import datetime, date
        now = datetime.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))
        
        # Get sessions for the specified month
        sessions = Session.objects.filter(
            therapist_id=therapist.id,
            scheduled_start_datetime__year=year,
            scheduled_start_datetime__month=month
        ).order_by('scheduled_start_datetime')
        
        # Group sessions by date
        calendar_data = {}
        for session in sessions:
            session_date = session.scheduled_start_datetime.date().isoformat()
            if session_date not in calendar_data:
                calendar_data[session_date] = []
            
            calendar_data[session_date].append({
                'id': session.id,
                'patient_name': session.get_patient_full_name(),
                'patient_id': session.patient_id,
                'start_time': session.scheduled_start_datetime.strftime('%H:%M'),
                'duration': session.duration,
                'status': session.status,
                'fee': float(session.fee)
            })
        
        return Response({
            'year': year,
            'month': month,
            'sessions': calendar_data
        })


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Session model providing CRUD operations
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return SessionListSerializer
        return SessionSerializer
    
    def list(self, request, *args, **kwargs):
        """List all sessions with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by therapist ID if provided
        therapist_id = request.query_params.get('therapist_id', None)
        if therapist_id:
            queryset = queryset.filter(therapist_id=therapist_id)
        
        # Filter by patient ID if provided
        patient_id = request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by status if provided
        status = request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(scheduled_start_datetime__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_start_datetime__date__lte=end_date)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update session status"""
        session = get_object_or_404(Session, pk=pk)
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['scheduled', 'commencing', 'cancelled', 'completed']:
            return Response(
                {"error": "Invalid status. Must be: scheduled, commencing, cancelled, or completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = new_status
        session.save()
        return Response({
            "message": f"Session status updated to {new_status}",
            "new_status": session.status
        })
    
    @action(detail=True, methods=['post'])
    def add_therapist_notes(self, request, pk=None):
        """Add therapist notes to a session"""
        session = get_object_or_404(Session, pk=pk)
        notes = request.data.get('notes')
        
        if not notes:
            return Response(
                {"error": "Notes are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.therapist_notes = notes
        session.save()
        return Response({
            "message": "Therapist notes updated successfully",
            "therapist_notes": session.therapist_notes
        })
    
    @action(detail=True, methods=['post'])
    def add_patient_notes(self, request, pk=None):
        """Add patient notes to a session"""
        session = get_object_or_404(Session, pk=pk)
        notes = request.data.get('notes')
        
        if not notes:
            return Response(
                {"error": "Notes are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.patient_notes = notes
        session.save()
        return Response({
            "message": "Patient notes updated successfully",
            "patient_notes": session.patient_notes
        })
    
    @action(detail=True, methods=['post'])
    def add_rating(self, request, pk=None):
        """Add patient rating to a session"""
        session = get_object_or_404(Session, pk=pk)
        rating = request.data.get('rating')
        patient_input = request.data.get('patient_input', '')
        
        if rating is None:
            return Response(
                {"error": "Rating is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            rating = float(rating)
            if rating < 0 or rating > 10 or (rating * 2) % 1 != 0:
                return Response(
                    {"error": "Rating must be between 0 and 10 in 0.5 steps"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Rating must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.patient_rating = rating
        session.patient_input = patient_input
        session.save()
        return Response({
            "message": "Rating added successfully",
            "patient_rating": session.patient_rating,
            "patient_input": session.patient_input
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment model providing CRUD operations
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    def list(self, request, *args, **kwargs):
        """List all payments with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by therapist ID if provided
        therapist_id = request.query_params.get('therapist_id', None)
        if therapist_id:
            queryset = queryset.filter(therapist_id=therapist_id)
        
        # Filter by patient ID if provided
        patient_id = request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by session ID if provided
        session_id = request.query_params.get('session_id', None)
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        
        # Filter by payment status if provided
        payment_status = request.query_params.get('status', None)
        if payment_status:
            queryset = queryset.filter(stat=payment_status)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        payment = get_object_or_404(Payment, pk=pk)
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['unpaid', 'successful', 'unsuccessful', 'waived']:
            return Response(
                {"error": "Invalid status. Must be: unpaid, successful, unsuccessful, or waived"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.stat = new_status
        payment.save()
        return Response({
            "message": f"Payment status updated to {new_status}",
            "new_status": payment.stat
        })


class ChatViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Chat model providing CRUD operations
    """
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ChatListSerializer
        elif self.action == 'retrieve':
            return ChatDetailSerializer
        return ChatSerializer
    
    def list(self, request, *args, **kwargs):
        """List all chats with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by therapist ID if provided
        therapist_id = request.query_params.get('therapist_id', None)
        if therapist_id:
            queryset = queryset.filter(therapist_id=therapist_id)
        
        # Filter by patient ID if provided
        patient_id = request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by status if provided
        status = request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by user participation
        user_id = request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(
                models.Q(therapist_id=user_id) | models.Q(patient_id=user_id)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_or_get_chat(self, request):
        """Create a new chat or get existing one between therapist and patient"""
        therapist_id = request.data.get('therapist_id')
        patient_id = request.data.get('patient_id')
        
        if not therapist_id or not patient_id:
            return Response(
                {"error": "Both therapist_id and patient_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if therapist and patient exist
        try:
            therapist = Therapist.objects.get(id=therapist_id)
            patient = Patient.objects.get(id=patient_id)
        except (Therapist.DoesNotExist, Patient.DoesNotExist):
            return Response(
                {"error": "Therapist or patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if chat already exists
        chat_id = f"CHAT_{therapist_id}_{patient_id}"
        chat, created = Chat.objects.get_or_create(
            id=chat_id,
            defaults={
                'therapist_first_name': therapist.first_name,
                'therapist_last_name': therapist.last_name,
                'therapist_id': therapist_id,
                'patient_first_name': patient.first_name,
                'patient_last_name': patient.last_name,
                'patient_id': patient_id,
            }
        )
        
        # Create chat room if chat was created
        if created:
            room_id = f"ROOM_{therapist_id}_{patient_id}"
            ChatRoom.objects.create(
                id=room_id,
                chat=chat,
                room_type='general'
            )
        
        serializer = ChatDetailSerializer(chat, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def get_user_chats(self, request):
        """Get all chats for a specific user"""
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get chats where user is either therapist or patient
        queryset = Chat.objects.filter(
            models.Q(therapist_id=user_id) | models.Q(patient_id=user_id)
        ).filter(status='active')
        
        serializer = ChatListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update chat status"""
        chat = get_object_or_404(Chat, pk=pk)
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['active', 'archived', 'blocked', 'deleted']:
            return Response(
                {"error": "Invalid status. Must be: active, archived, blocked, or deleted"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        chat.status = new_status
        chat.save()
        
        return Response({
            "message": f"Chat status updated to {new_status}",
            "new_status": chat.status
        })
    
    @action(detail=True, methods=['post'])
    def toggle_notifications(self, request, pk=None):
        """Toggle notifications for a user in the chat"""
        chat = get_object_or_404(Chat, pk=pk)
        user_id = request.data.get('user_id')
        notifications_enabled = request.data.get('notifications_enabled', True)
        
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user_id == chat.therapist_id:
            chat.therapist_notifications = notifications_enabled
        elif user_id == chat.patient_id:
            chat.patient_notifications = notifications_enabled
        else:
            return Response(
                {"error": "User is not a participant in this chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        chat.save()
        return Response({
            "message": f"Notifications {'enabled' if notifications_enabled else 'disabled'}",
            "notifications_enabled": notifications_enabled
        })
    
    @action(detail=True, methods=['post'])
    def mark_all_read(self, request, pk=None):
        """Mark all messages in chat as read for a user"""
        chat = get_object_or_404(Chat, pk=pk)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user_id not in [chat.therapist_id, chat.patient_id]:
            return Response(
                {"error": "User is not a participant in this chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark all unread messages as read
        unread_messages = Message.objects.filter(
            chat_id=chat.id,
            read_status__in=['sent', 'delivered'],
            sender_id__ne=user_id
        )
        
        for message in unread_messages:
            message.mark_as_read(user_id)
        
        # Reset unread count
        chat.reset_unread_count(user_id)
        
        return Response({
            "message": "All messages marked as read",
            "unread_count": 0
        })


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message model providing CRUD operations
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return MessageListSerializer
        elif self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def list(self, request, *args, **kwargs):
        """List all messages with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by chat ID if provided
        chat_id = request.query_params.get('chat_id', None)
        if chat_id:
            queryset = queryset.filter(chat_id=chat_id)
        
        # Filter by sender ID if provided
        sender_id = request.query_params.get('sender_id', None)
        if sender_id:
            queryset = queryset.filter(sender_id=sender_id)
        
        # Filter by emergency status if provided
        emergency = request.query_params.get('emergency', None)
        if emergency is not None:
            queryset = queryset.filter(emergency=emergency.lower() == 'true')
        
        # Filter by message type if provided
        message_type = request.query_params.get('message_type', None)
        if message_type:
            queryset = queryset.filter(message_type=message_type)
        
        # Filter by read status if provided
        read_status = request.query_params.get('read_status', None)
        if read_status:
            queryset = queryset.filter(read_status=read_status)
        
        # Exclude deleted messages by default
        exclude_deleted = request.query_params.get('exclude_deleted', 'true')
        if exclude_deleted.lower() == 'true':
            queryset = queryset.filter(deleted=False)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new message"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Get sender ID from request user
            user_id = getattr(request.user, 'id', None)
            if not user_id:
                return Response(
                    {"error": "User ID not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create message
            message = serializer.save(sender_id=str(user_id))
            
            # Update chat with last message info
            chat = Chat.objects.get(id=message.chat_id)
            chat.last_message_text = message.text
            chat.last_message_timestamp = message.timestamp
            chat.last_message_sender_id = message.sender_id
            chat.updated_at = message.timestamp
            
            # Increment unread count for the other participant
            other_participant_id = chat.patient_id if message.sender_id == chat.therapist_id else chat.therapist_id
            chat.increment_unread_count(other_participant_id)
            
            chat.save()
            
            # Return created message
            response_serializer = MessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_emergency(self, request, pk=None):
        """Mark a message as emergency"""
        message = get_object_or_404(Message, pk=pk)
        message.emergency = True
        message.save()
        return Response({
            "message": "Message marked as emergency",
            "emergency": message.emergency
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = get_object_or_404(Message, pk=pk)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is participant in the chat
        chat = Chat.objects.get(id=message.chat_id)
        if user_id not in [chat.therapist_id, chat.patient_id]:
            return Response(
                {"error": "User is not a participant in this chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.mark_as_read(user_id)
        return Response({
            "message": "Message marked as read",
            "read_status": message.read_status,
            "read_at": message.read_at
        })
    
    @action(detail=True, methods=['post'])
    def edit_message(self, request, pk=None):
        """Edit a message"""
        message = get_object_or_404(Message, pk=pk)
        new_text = request.data.get('text')
        
        if not new_text:
            return Response(
                {"error": "New text is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is the sender
        user_id = getattr(request.user, 'id', None)
        if str(user_id) != message.sender_id:
            return Response(
                {"error": "You can only edit your own messages"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.edit_message(new_text)
        return Response({
            "message": "Message edited successfully",
            "text": message.text,
            "edited": message.edited,
            "edited_at": message.edited_at
        })
    
    @action(detail=True, methods=['post'])
    def delete_message(self, request, pk=None):
        """Soft delete a message"""
        message = get_object_or_404(Message, pk=pk)
        user_id = getattr(request.user, 'id', None)
        
        if not user_id:
            return Response(
                {"error": "User ID not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is the sender or participant in the chat
        chat = Chat.objects.get(id=message.chat_id)
        if str(user_id) != message.sender_id and str(user_id) not in [chat.therapist_id, chat.patient_id]:
            return Response(
                {"error": "You can only delete your own messages or be a participant in the chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.soft_delete(str(user_id))
        return Response({
            "message": "Message deleted successfully",
            "deleted": message.deleted,
            "deleted_at": message.deleted_at
        })
    
    @action(detail=False, methods=['get'])
    def get_unread_messages(self, request):
        """Get unread messages for a user"""
        user_id = request.query_params.get('user_id')
        chat_id = request.query_params.get('chat_id')
        
        if not user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = Message.objects.filter(
            read_status__in=['sent', 'delivered'],
            sender_id__ne=user_id,
            deleted=False
        )
        
        if chat_id:
            queryset = queryset.filter(chat_id=chat_id)
        else:
            # Get all chats where user is participant
            user_chats = Chat.objects.filter(
                models.Q(therapist_id=user_id) | models.Q(patient_id=user_id)
            )
            chat_ids = [chat.id for chat in user_chats]
            queryset = queryset.filter(chat_id__in=chat_ids)
        
        serializer = MessageListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """Send a new message with enhanced functionality"""
        chat_id = request.data.get('chat_id')
        text = request.data.get('text')
        message_type = request.data.get('message_type', 'text')
        emergency = request.data.get('emergency', False)
        reply_to = request.data.get('reply_to')
        
        if not chat_id or not text:
            return Response(
                {"error": "chat_id and text are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if chat exists and user is participant
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Response(
                {"error": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_id = getattr(request.user, 'id', None)
        if str(user_id) not in [chat.therapist_id, chat.patient_id]:
            return Response(
                {"error": "You are not a participant in this chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create message
        message_data = {
            'chat_id': chat_id,
            'text': text,
            'message_type': message_type,
            'emergency': emergency,
            'sender_id': str(user_id)
        }
        
        if reply_to:
            message_data['reply_to'] = reply_to
        
        serializer = MessageCreateSerializer(data=message_data, context={'request': request})
        if serializer.is_valid():
            message = serializer.save()
            
            # Update chat with last message info
            chat.last_message_text = message.text
            chat.last_message_timestamp = message.timestamp
            chat.last_message_sender_id = message.sender_id
            chat.updated_at = message.timestamp
            
            # Increment unread count for the other participant
            other_participant_id = chat.patient_id if message.sender_id == chat.therapist_id else chat.therapist_id
            chat.increment_unread_count(other_participant_id)
            
            chat.save()
            
            response_serializer = MessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatRoom model providing CRUD operations
    """
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ChatRoomListSerializer
        return ChatRoomSerializer
    
    def list(self, request, *args, **kwargs):
        """List all chat rooms with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by room type if provided
        room_type = request.query_params.get('room_type', None)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        
        # Filter by active status if provided
        is_active = request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by archived status if provided
        is_archived = request.query_params.get('is_archived', None)
        if is_archived is not None:
            queryset = queryset.filter(is_archived=is_archived.lower() == 'true')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_permissions(self, request, pk=None):
        """Update room permissions"""
        room = get_object_or_404(ChatRoom, pk=pk)
        
        therapist_can_send = request.data.get('therapist_can_send')
        patient_can_send = request.data.get('patient_can_send')
        therapist_can_see_history = request.data.get('therapist_can_see_history')
        patient_can_see_history = request.data.get('patient_can_see_history')
        
        if therapist_can_send is not None:
            room.therapist_can_send = therapist_can_send
        if patient_can_send is not None:
            room.patient_can_send = patient_can_send
        if therapist_can_see_history is not None:
            room.therapist_can_see_history = therapist_can_see_history
        if patient_can_see_history is not None:
            room.patient_can_see_history = patient_can_see_history
        
        room.save()
        
        return Response({
            "message": "Room permissions updated successfully",
            "therapist_can_send": room.therapist_can_send,
            "patient_can_send": room.patient_can_send,
            "therapist_can_see_history": room.therapist_can_see_history,
            "patient_can_see_history": room.patient_can_see_history
        })
    
    @action(detail=True, methods=['post'])
    def archive_room(self, request, pk=None):
        """Archive the chat room"""
        room = get_object_or_404(ChatRoom, pk=pk)
        room.archive_room()
        
        return Response({
            "message": "Room archived successfully",
            "is_archived": room.is_archived,
            "is_active": room.is_active
        })
    
    @action(detail=True, methods=['post'])
    def activate_room(self, request, pk=None):
        """Activate the chat room"""
        room = get_object_or_404(ChatRoom, pk=pk)
        room.activate_room()
        
        return Response({
            "message": "Room activated successfully",
            "is_archived": room.is_archived,
            "is_active": room.is_active
        })


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Review model providing CRUD operations
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ReviewListSerializer
        return ReviewSerializer
    
    def list(self, request, *args, **kwargs):
        """List all reviews with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by therapist ID if provided
        therapist_id = request.query_params.get('therapist_id', None)
        if therapist_id:
            queryset = queryset.filter(therapist_id=therapist_id)
        
        # Filter by patient ID if provided
        patient_id = request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by minimum score if provided
        min_score = request.query_params.get('min_score', None)
        if min_score:
            try:
                min_score = float(min_score)
                queryset = queryset.filter(score__gte=min_score)
            except ValueError:
                pass
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotebookViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Notebook model providing CRUD operations
    """
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return NotebookListSerializer
        return NotebookSerializer
    
    def list(self, request, *args, **kwargs):
        """List all notebooks with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by author ID if provided
        author_id = request.query_params.get('author_id', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Page model providing CRUD operations
    """
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return PageListSerializer
        return PageSerializer
    
    def list(self, request, *args, **kwargs):
        """List all pages with optional filtering"""
        queryset = self.get_queryset()
        
        # Filter by notebook ID if provided
        notebook_id = request.query_params.get('notebook_id', None)
        if notebook_id:
            queryset = queryset.filter(notebook_id=notebook_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_text(self, request, pk=None):
        """Add text to a page"""
        page = get_object_or_404(Page, pk=pk)
        text_content = request.data.get('text')
        key = request.data.get('key')  # Optional custom key, defaults to timestamp
        
        if not text_content:
            return Response(
                {"error": "Text content is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not key:
            from datetime import datetime
            key = datetime.now().isoformat()
        
        page.text[key] = text_content
        page.save()
        return Response({
            "message": "Text added successfully",
            "sorted_texts": page.get_sorted_texts()
        })
    
    @action(detail=True, methods=['post'])
    def remove_text(self, request, pk=None):
        """Remove text from a page by key"""
        page = get_object_or_404(Page, pk=pk)
        key = request.data.get('key')
        
        if not key:
            return Response(
                {"error": "Key is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if key in page.text:
            del page.text[key]
            page.save()
            return Response({
                "message": f"Text with key '{key}' removed successfully",
                "sorted_texts": page.get_sorted_texts()
            })
        else:
            return Response(
                {"error": f"Key '{key}' not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Availability model providing CRUD operations
    """
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return AvailabilityListSerializer
        return AvailabilitySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        therapist_id = request.query_params.get('therapist_id')
        if therapist_id:
            queryset = queryset.filter(therapist_id=therapist_id)

        date = request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        time_slot = request.query_params.get('time_slot')
        if time_slot:
            queryset = queryset.filter(time_slot=time_slot)

        only_open = request.query_params.get('only_open')
        if only_open == 'true':
            queryset = queryset.filter(session_id__isnull=True)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
