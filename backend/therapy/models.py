from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class Patient(models.Model):
    # Custom ID field with pattern p_xxxxxx where x is alphanumeric
    id = models.CharField(
        max_length=8,
        primary_key=True,
        validators=[
            RegexValidator(
                regex=r'^p_[a-z0-9]{6}$',
                message='Patient ID must be in format p_xxxxxx where x is lowercase alphanumeric'
            )
        ],
        help_text='Format: p_xxxxxx (e.g., p_abc123)'
    )
    
    # Password field with length validation
    password = models.CharField(
        max_length=64,
        validators=[
            MinLengthValidator(8, message='Password must be at least 8 characters long'),
            MaxLengthValidator(64, message='Password cannot exceed 64 characters')
        ]
    )
    
    # Required name fields
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    # Optional SSN field
    ssn = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{3}-\d{2}-\d{4}$',
                message='SSN must be in format XXX-XX-XXXX'
            )
        ]
    )
    
    # Required unique phone number
    phone_no = models.CharField(
        max_length=15,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be valid and contain 9-15 digits'
            )
        ]
    )
    
    # Required unique email field
    email = models.EmailField(unique=True)
    
    # Optional address field
    address = models.TextField(blank=True, null=True)
    
    # Optional added note with max 500 characters
    added_note = models.TextField(max_length=500, blank=True, null=True)
    
    # Required allergies and medication field
    allergies_and_medication = models.TextField()
    
    # Required date of birth
    date_of_birth = models.DateField()
    
    # Required sex field with choices
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say')
    ]
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    
    # Optional profile picture
    profile_picture = models.ImageField(
        upload_to='patient_profiles/',
        blank=True,
        null=True
    )
    
    # Optional about note with max 250 characters
    about_note = models.TextField(max_length=250, blank=True, null=True)
    
    # Tags field as JSONField (PostgreSQL specific)
    tags = models.JSONField(default=list, blank=True)
    
    # Wallet balance with default 0, constrained between 0 and 1000
    wallet_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    # Removed: sessions JSON field migrated to dedicated Availability/Session flows
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def clean(self):
        """Validate wallet balance constraints"""
        from django.core.exceptions import ValidationError
        if self.wallet_balance < 0:
            raise ValidationError({'wallet_balance': 'Account balance cannot be less than 0'})
        if self.wallet_balance > 1000:
            raise ValidationError({'wallet_balance': 'Account balance cannot be more than 1000'})
    
    def can_update_field(self, field_name):
        """Check if a field can be updated after initial creation"""
        if field_name in ['ssn', 'date_of_birth'] and self.pk:
            return False
        return True
    
    def get_default_profile_picture(self):
        """Return default profile picture based on sex"""
        if self.sex == 'M':
            return 'default_male_avatar.png'
        elif self.sex == 'F':
            return 'default_female_avatar.png'
        else:
            return 'default_avatar.png'
    
    def has_completed_session_with_therapist(self, therapist_id):
        """Check if patient has at least one completed session with a therapist"""
        return Session.objects.filter(
            patient_id=self.id,
            therapist_id=therapist_id,
            status='completed'
        ).exists()
    
    def can_make_payment(self, amount):
        """Check if patient can make a payment with given amount"""
        return self.wallet_balance >= amount
    
    def adjust_balance(self, amount):
        """Adjust wallet balance by amount (positive to add, negative to subtract)"""
        new_balance = self.wallet_balance + amount
        if new_balance < 0:
            raise ValueError("Insufficient balance")
        if new_balance > 1000:
            raise ValueError("Balance cannot exceed 1000")
        self.wallet_balance = new_balance
        self.save()


class Therapist(models.Model):
    # Custom ID field with pattern t_xxxxxx where x is alphanumeric
    id = models.CharField(
        max_length=8,
        primary_key=True,
        validators=[
            RegexValidator(
                regex=r'^t_[a-z0-9]{6}$',
                message='Therapist ID must be in format t_xxxxxx where x is lowercase alphanumeric'
            )
        ],
        help_text='Format: t_xxxxxx (e.g., t_abc123)'
    )
    
    # Password field with length validation
    password = models.CharField(
        max_length=64,
        validators=[
            MinLengthValidator(8, message='Password must be at least 8 characters long'),
            MaxLengthValidator(64, message='Password cannot exceed 64 characters')
        ]
    )
    
    # Required name fields
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    # Required unique SSN field
    ssn = models.CharField(
        max_length=11,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{3}-\d{2}-\d{4}$',
                message='SSN must be in format XXX-XX-XXXX'
            )
        ]
    )
    
    # Required unique phone number
    phone_no = models.CharField(
        max_length=15,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be valid and contain 9-15 digits'
            )
        ]
    )
    
    # Required email field
    email = models.EmailField()
    
    # Optional address fields
    house_addr = models.TextField(blank=True, null=True)
    work_addr = models.TextField(blank=True, null=True)
    
    # Verified certificates as JSONField
    verified_certificates = models.JSONField(default=list, blank=True)
    
    # Years active field
    years_active = models.PositiveIntegerField(default=0)
    
    # Required date of birth
    date_of_birth = models.DateField()
    
    # Required sex field with choices
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say')
    ]
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    
    # Required education as JSONField
    education = models.JSONField(default=list)
    
    # Optional profile picture
    profile_picture = models.ImageField(
        upload_to='therapist_profiles/',
        blank=True,
        null=True
    )
    
    # Area of expertise as JSONField
    area_of_expertise = models.JSONField(default=list, blank=True)
    
    # About note with max 300 characters
    about_note = models.TextField(max_length=300, blank=True, null=True)
    
    # Removed: availability JSON field migrated to dedicated Availability model
    
    # Average score field
    average_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00
    )
    
    # No payment boolean field
    no_payment = models.BooleanField(default=False)
    
    # No payment patients as JSONField (empty if no_payment is False)
    no_payment_patients = models.JSONField(default=list, blank=True)
    
    # Receive emergency messages boolean field
    receive_emergency_messages = models.BooleanField(default=False)
    
    # Can send emergency messages as JSONField (empty if receive_emergency_messages is False)
    can_send_emergency_messages = models.JSONField(default=list, blank=True)
    
    # Wallet balance with default 0
    wallet_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'therapists'
        verbose_name = 'Therapist'
        verbose_name_plural = 'Therapists'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def get_experience_years(self):
        from datetime import date
        today = date.today()
        return today.year - self.created_at.year + self.years_active
    
    def adjust_balance(self, amount):
        """Adjust wallet balance by amount (positive to add, negative to subtract)"""
        new_balance = self.wallet_balance + amount
        self.wallet_balance = new_balance
        self.save()


class Session(models.Model):
    # Composite ID: therapist_id + patient_id + start_datetime
    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text='Format: {therapist_id}_{patient_id}_{YYYYMMDD_HHMM}'
    )
    
    # Therapist information
    therapist_first_name = models.CharField(max_length=100)
    therapist_last_name = models.CharField(max_length=100)
    therapist_id = models.CharField(max_length=8)
    
    # Patient information
    patient_first_name = models.CharField(max_length=100)
    patient_last_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=8)
    
    # Session details
    scheduled_start_datetime = models.DateTimeField()
    payment_stat = models.CharField(max_length=20, default='pending')
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status choices
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('commencing', 'Commencing'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Notes
    therapist_notes = models.TextField(blank=True, null=True)
    patient_notes = models.TextField(blank=True, null=True)
    
    # Session details
    duration = models.PositiveIntegerField(default=60, help_text='Duration in minutes')
    patient_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^([0-9]|10)(\.5)?$',
                message='Rating must be between 0 and 10 in 0.5 steps'
            )
        ]
    )
    patient_input = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sessions'
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'
        ordering = ['-scheduled_start_datetime']
    
    def __str__(self):
        return f"Session {self.id} - {self.therapist_first_name} {self.therapist_last_name} & {self.patient_first_name} {self.patient_last_name}"
    
    def get_therapist_full_name(self):
        return f"{self.therapist_first_name} {self.therapist_last_name}"
    
    def get_patient_full_name(self):
        return f"{self.patient_first_name} {self.patient_last_name}"
    
    def can_be_reserved(self):
        """Check if session can be reserved (24 hours to 6 months in advance)"""
        from datetime import datetime, timedelta
        now = datetime.now()
        session_time = self.scheduled_start_datetime
        
        # Must be at least 24 hours in advance
        min_advance = now + timedelta(hours=24)
        # Must be no more than 6 months in advance
        max_advance = now + timedelta(days=180)
        
        return min_advance <= session_time <= max_advance
    
    def can_be_cancelled(self):
        """Check if session can be cancelled (24 hours before start)"""
        from datetime import datetime, timedelta
        now = datetime.now()
        session_time = self.scheduled_start_datetime
        
        # Must be at least 24 hours before session
        return now <= session_time - timedelta(hours=24)
    
    def is_join_button_active(self):
        """Check if join button should be active (10 minutes before session)"""
        from datetime import datetime, timedelta
        now = datetime.now()
        session_time = self.scheduled_start_datetime
        
        # Active 10 minutes before session start
        join_start = session_time - timedelta(minutes=10)
        # Deactivated after session time
        join_end = session_time
        
        return join_start <= now <= join_end and self.status == 'scheduled'
    
    def can_be_joined(self):
        """Check if session can be joined (within time window)"""
        from datetime import datetime, timedelta
        now = datetime.now()
        session_time = self.scheduled_start_datetime
        
        # Can join 10 minutes before until session time
        join_start = session_time - timedelta(minutes=10)
        join_end = session_time + timedelta(minutes=self.duration)
        
        return join_start <= now <= join_end and self.status in ['scheduled', 'commencing']


class Payment(models.Model):
    # Unique payment ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: PAY_{YYYYMMDD}_{random_string}'
    )
    
    # Session relationship
    session_id = models.CharField(max_length=50)
    
    # Therapist information
    therapist_first_name = models.CharField(max_length=100)
    therapist_last_name = models.CharField(max_length=100)
    therapist_id = models.CharField(max_length=8)
    
    # Patient information
    patient_first_name = models.CharField(max_length=100)
    patient_last_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=8)
    
    # Payment details
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('successful', 'Successful'),
        ('unsuccessful', 'Unsuccessful'),
        ('waived', 'Waived')
    ]
    stat = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Payment {self.id} - {self.stat} - ${self.fee}"
    
    def get_therapist_full_name(self):
        return f"{self.therapist_first_name} {self.therapist_last_name}"
    
    def get_patient_full_name(self):
        return f"{self.patient_first_name} {self.patient_last_name}"
    
    def can_reserve_session(self):
        """Check if payment status allows session reservation"""
        return self.stat in ['successful', 'waived']
    
    def process_payment(self, patient, therapist):
        """Process payment and adjust balances"""
        if self.stat == 'successful':
            # Subtract from patient balance
            patient.adjust_balance(-self.fee)
            # Add to therapist balance
            therapist.adjust_balance(self.fee)
        # 'waived' payments don't affect balances
    
    def refund_payment(self, patient, therapist):
        """Refund payment and adjust balances"""
        if self.stat == 'successful':
            # Add back to patient balance
            patient.adjust_balance(self.fee)
            # Subtract from therapist balance
            therapist.adjust_balance(-self.fee)


class Chat(models.Model):
    # Unique chat ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: CHAT_{therapist_id}_{patient_id}'
    )
    
    # Therapist information
    therapist_first_name = models.CharField(max_length=100)
    therapist_last_name = models.CharField(max_length=100)
    therapist_id = models.CharField(max_length=8)
    
    # Patient information
    patient_first_name = models.CharField(max_length=100)
    patient_last_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=8)
    
    # Chat status and metadata
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('blocked', 'Blocked'),
        ('deleted', 'Deleted')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Last message information for quick access
    last_message_text = models.TextField(blank=True, null=True)
    last_message_timestamp = models.DateTimeField(blank=True, null=True)
    last_message_sender_id = models.CharField(max_length=8, blank=True, null=True)
    
    # Unread message counts
    therapist_unread_count = models.PositiveIntegerField(default=0)
    patient_unread_count = models.PositiveIntegerField(default=0)
    
    # Chat settings
    therapist_notifications = models.BooleanField(default=True)
    patient_notifications = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chats'
        verbose_name = 'Chat'
        verbose_name_plural = 'Chats'
        ordering = ['-updated_at']
        unique_together = ['therapist_id', 'patient_id']
    
    def __str__(self):
        return f"Chat {self.id} - {self.therapist_first_name} {self.therapist_last_name} & {self.patient_first_name} {self.patient_last_name}"
    
    def get_therapist_full_name(self):
        return f"{self.therapist_first_name} {self.therapist_last_name}"
    
    def get_patient_full_name(self):
        return f"{self.patient_first_name} {self.patient_last_name}"
    
    def get_other_participant(self, user_id):
        """Get the other participant in the chat"""
        if user_id == self.therapist_id:
            return {
                'id': self.patient_id,
                'first_name': self.patient_first_name,
                'last_name': self.patient_last_name,
                'full_name': self.get_patient_full_name()
            }
        elif user_id == self.patient_id:
            return {
                'id': self.therapist_id,
                'first_name': self.therapist_first_name,
                'last_name': self.therapist_last_name,
                'full_name': self.get_therapist_full_name()
            }
        return None
    
    def get_unread_count(self, user_id):
        """Get unread message count for a specific user"""
        if user_id == self.therapist_id:
            return self.therapist_unread_count
        elif user_id == self.patient_id:
            return self.patient_unread_count
        return 0
    
    def increment_unread_count(self, user_id):
        """Increment unread count for a specific user"""
        if user_id == self.therapist_id:
            self.therapist_unread_count += 1
        elif user_id == self.patient_id:
            self.patient_unread_count += 1
        self.save()
    
    def reset_unread_count(self, user_id):
        """Reset unread count for a specific user"""
        if user_id == self.therapist_id:
            self.therapist_unread_count = 0
        elif user_id == self.patient_id:
            self.patient_unread_count = 0
        self.save()
    
    def has_unread_emergency_messages(self, user_id):
        """Check if chat has unread emergency messages for user"""
        from .models import Message
        return Message.objects.filter(
            chat_id=self.id,
            emergency=True,
            read_status__in=['sent', 'delivered']
        ).exclude(sender_id=user_id).exists()
    
    def get_priority_score(self, user_id):
        """Get priority score for chat (higher = more priority)"""
        # Base priority
        priority = 0
        
        # Emergency messages get highest priority
        if self.has_unread_emergency_messages(user_id):
            priority += 1000
        
        # Unread count adds to priority
        unread_count = self.get_unread_count(user_id)
        priority += unread_count
        
        return priority


class Message(models.Model):
    # Unique message ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: MSG_{timestamp}_{random_string}'
    )
    
    # Chat relationship
    chat_id = models.CharField(max_length=20)
    sender_id = models.CharField(max_length=8, help_text='ID of the sender (therapist or patient)')
    
    # Message content
    text = models.TextField()
    emergency = models.BooleanField(default=False)
    
    # Message type and metadata
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
        ('appointment', 'Appointment'),
        ('prescription', 'Prescription')
    ]
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    
    # File attachments
    attachment_url = models.URLField(blank=True, null=True)
    attachment_name = models.CharField(max_length=255, blank=True, null=True)
    attachment_size = models.PositiveIntegerField(blank=True, null=True, help_text='File size in bytes')
    
    # Message status and read receipts
    READ_STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read')
    ]
    read_status = models.CharField(max_length=20, choices=READ_STATUS_CHOICES, default='sent')
    read_at = models.DateTimeField(blank=True, null=True)
    read_by = models.CharField(max_length=8, blank=True, null=True, help_text='ID of user who read the message')
    
    # Reply functionality
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, related_name='replies')
    
    # Message editing and deletion
    edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(blank=True, null=True)
    deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.CharField(max_length=8, blank=True, null=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['chat_id', 'timestamp']),
            models.Index(fields=['sender_id', 'timestamp']),
            models.Index(fields=['read_status', 'timestamp']),
        ]
    
    def __str__(self):
        emergency_flag = " [EMERGENCY]" if self.emergency else ""
        type_flag = f" [{self.message_type.upper()}]" if self.message_type != 'text' else ""
        return f"Message {self.id} from {self.sender_id}{emergency_flag}{type_flag}"
    
    def mark_as_read(self, user_id):
        """Mark message as read by a specific user"""
        if self.read_status != 'read':
            self.read_status = 'read'
            self.read_at = timezone.now()
            self.read_by = user_id
            self.save()
    
    def mark_as_delivered(self):
        """Mark message as delivered"""
        if self.read_status == 'sent':
            self.read_status = 'delivered'
            self.save()
    
    def soft_delete(self, user_id):
        """Soft delete the message"""
        self.deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user_id
        self.save()
    
    def edit_message(self, new_text):
        """Edit the message text"""
        self.text = new_text
        self.edited = True
        self.edited_at = timezone.now()
        self.save()
    
    def get_reply_chain(self):
        """Get the full reply chain for this message"""
        if self.reply_to:
            return self.reply_to.get_reply_chain() + [self]
        return [self]
    
    @classmethod
    def can_send_emergency_message(cls, sender_id, chat_id):
        """Check if sender can send emergency message (max 15 in a row)"""
        # Get last 15 messages from this sender in this chat
        recent_messages = cls.objects.filter(
            chat_id=chat_id,
            sender_id=sender_id
        ).order_by('-timestamp')[:15]
        
        # Check if all recent messages are emergency
        if len(recent_messages) < 15:
            return True
        
        return not all(msg.emergency for msg in recent_messages)
    
    @classmethod
    def get_emergency_message_count(cls, sender_id, chat_id):
        """Get count of consecutive emergency messages from sender"""
        recent_messages = cls.objects.filter(
            chat_id=chat_id,
            sender_id=sender_id
        ).order_by('-timestamp')
        
        count = 0
        for msg in recent_messages:
            if msg.emergency:
                count += 1
            else:
                break
        
        return count


class ChatRoom(models.Model):
    """Model for managing chat room participants and permissions"""
    # Unique chat room ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: ROOM_{therapist_id}_{patient_id}'
    )
    
    # Chat relationship
    chat = models.OneToOneField(Chat, on_delete=models.CASCADE, related_name='room')
    
    # Room settings
    ROOM_TYPE_CHOICES = [
        ('therapy', 'Therapy Session'),
        ('consultation', 'Consultation'),
        ('emergency', 'Emergency'),
        ('general', 'General Chat')
    ]
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='general')
    
    # Room permissions
    therapist_can_send = models.BooleanField(default=True)
    patient_can_send = models.BooleanField(default=True)
    therapist_can_see_history = models.BooleanField(default=True)
    patient_can_see_history = models.BooleanField(default=True)
    
    # Room metadata
    description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Room status
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_rooms'
        verbose_name = 'Chat Room'
        verbose_name_plural = 'Chat Rooms'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"ChatRoom {self.id} - {self.room_type}"
    
    def can_user_send_message(self, user_id):
        """Check if user can send messages in this room"""
        if not self.is_active or self.is_archived:
            return False
        
        if user_id == self.chat.therapist_id:
            return self.therapist_can_send
        elif user_id == self.chat.patient_id:
            return self.patient_can_send
        return False
    
    def can_user_see_history(self, user_id):
        """Check if user can see message history"""
        if user_id == self.chat.therapist_id:
            return self.therapist_can_see_history
        elif user_id == self.chat.patient_id:
            return self.patient_can_see_history
        return False
    
    def archive_room(self):
        """Archive the chat room"""
        self.is_archived = True
        self.is_active = False
        self.save()
    
    def activate_room(self):
        """Activate the chat room"""
        self.is_active = True
        self.is_archived = False
        self.save()


class Availability(models.Model):
    # Unique availability ID
    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text='Format: AVAIL_{therapist_id}_{YYYYMMDD}_{slot}'
    )

    therapist_id = models.CharField(max_length=8)
    date = models.DateField()

    # Time slot choices (hourly from 08-09 to 21-22)
    TIME_SLOT_CHOICES = [
        (f"{h}-{h+1}", f"{h}:00-{h+1}:00") for h in range(8, 22)
    ]
    time_slot = models.CharField(max_length=10, choices=TIME_SLOT_CHOICES)

    # When booked, link to a session id; otherwise null
    session_id = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'availabilities'
        verbose_name = 'Availability'
        verbose_name_plural = 'Availabilities'
        ordering = ['date', 'time_slot']

    def __str__(self):
        return f"Availability {self.id} ({self.therapist_id} {self.date} {self.time_slot})"
    
    def is_available(self):
        """Check if availability slot is free for booking"""
        return self.session_id is None
    
    def can_be_booked(self):
        """Check if availability can be booked (within time constraints)"""
        from datetime import datetime, timedelta, date
        now = datetime.now()
        session_datetime = datetime.combine(self.date, datetime.min.time().replace(hour=int(self.time_slot.split('-')[0])))
        
        # Must be at least 24 hours in advance
        min_advance = now + timedelta(hours=24)
        # Must be no more than 6 months in advance
        max_advance = now + timedelta(days=180)
        
        return (self.is_available() and 
                min_advance <= session_datetime <= max_advance)
    
    def book_session(self, session_id):
        """Book this availability slot with a session"""
        if not self.is_available():
            raise ValueError("Availability slot is already booked")
        self.session_id = session_id
        self.save()
    
    def free_slot(self):
        """Free up this availability slot (for patient cancellations)"""
        self.session_id = None
        self.save()
    
    def delete_availability(self):
        """Delete this availability (for therapist cancellations)"""
        self.delete()


class Review(models.Model):
    # Unique review ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: REV_{timestamp}_{random_string}'
    )
    
    # Rating (0-10 in 0.5 steps)
    score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[
            RegexValidator(
                regex=r'^([0-9]|10)(\.5)?$',
                message='Score must be between 0 and 10 in 0.5 steps'
            )
        ]
    )
    
    # Review text
    text = models.TextField(blank=True, null=True)
    
    # Therapist information
    therapist_first_name = models.CharField(max_length=100)
    therapist_last_name = models.CharField(max_length=100)
    therapist_id = models.CharField(max_length=8)
    
    # Patient information
    patient_first_name = models.CharField(max_length=100)
    patient_last_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=8)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Review {self.id} - {self.score}/10 by {self.patient_first_name} {self.patient_last_name}"
    
    def get_therapist_full_name(self):
        return f"{self.therapist_first_name} {self.therapist_last_name}"
    
    def get_patient_full_name(self):
        return f"{self.patient_first_name} {self.patient_last_name}"
    
    @classmethod
    def can_patient_review_therapist(cls, patient_id, therapist_id):
        """Check if patient can review therapist (must have completed session)"""
        from .models import Session
        return Session.objects.filter(
            patient_id=patient_id,
            therapist_id=therapist_id,
            status='completed'
        ).exists()


class Notebook(models.Model):
    # Unique notebook ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: NOTE_{author_id}_{timestamp}'
    )
    
    # Author information
    author_id = models.CharField(max_length=8, help_text='ID of the author (therapist or patient)')
    front_note = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notebooks'
        verbose_name = 'Notebook'
        verbose_name_plural = 'Notebooks'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Notebook {self.id} by {self.author_id}"


class Page(models.Model):
    # Unique page ID
    id = models.CharField(
        max_length=20,
        primary_key=True,
        help_text='Format: PAGE_{notebook_id}_{timestamp}'
    )
    
    # Notebook relationship
    notebook_id = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    
    # Text content as JSONField with string keys (timestamps by default)
    text = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pages'
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Page {self.id} - {self.title}"
    
    def get_sorted_texts(self):
        """Return texts sorted by creation order (key value)"""
        return dict(sorted(self.text.items(), key=lambda x: x[0]))