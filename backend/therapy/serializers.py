from rest_framework import serializers
from .models import Patient, Therapist, Session, Payment, Chat, Message, Review, Notebook, Page, Availability, ChatRoom

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField(source='get_age')
    full_name = serializers.ReadOnlyField(source='get_full_name')
    
    class Meta:
        model = Patient
        fields = [
            'id', 'password', 'first_name', 'last_name', 'ssn', 'phone_no',
            'email', 'address', 'added_note', 'allergies_and_medication',
            'date_of_birth', 'sex', 'profile_picture', 'about_note',
            'tags', 'wallet_balance', 'created_at', 'updated_at',
            'age', 'full_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'age', 'full_name']
        extra_kwargs = {
            'id': {'required': False},
            'password': {'write_only': True},
            'ssn': {'required': False},
            'email': {'required': False},
            'address': {'required': False},
            'added_note': {'required': False},
            'profile_picture': {'required': False},
            'about_note': {'required': False},
            'tags': {'required': False}
        }
    
    def create(self, validated_data):
        # Ensure patient ID is generated if not provided
        if 'id' not in validated_data or not validated_data.get('id'):
            import random
            import string
            from .models import Patient as PatientModel
            def generate_patient_id():
                return 'p_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            new_id = generate_patient_id()
            # Guarantee uniqueness
            while PatientModel.objects.filter(id=new_id).exists():
                new_id = generate_patient_id()
            validated_data['id'] = new_id

        # Hash the password before saving (plaintext kept to match current model behavior)
        password = validated_data.pop('password', None)
        patient = super().create(validated_data)
        if password:
            patient.password = password  # In production, you'd hash this
            patient.save()
        return patient
    
    def update(self, instance, validated_data):
        # Handle password update if provided
        password = validated_data.pop('password', None)
        patient = super().update(instance, validated_data)
        if password:
            patient.password = password  # In production, you'd hash this
            patient.save()
        return patient

class PatientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing patients"""
    age = serializers.ReadOnlyField(source='get_age')
    full_name = serializers.ReadOnlyField(source='get_full_name')
    
    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'phone_no', 'email',
            'date_of_birth', 'sex', 'profile_picture', 'tags',
            'wallet_balance', 'created_at', 'age', 'full_name'
        ]
        read_only_fields = ['created_at', 'age', 'full_name']


class TherapistSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField(source='get_age')
    full_name = serializers.ReadOnlyField(source='get_full_name')
    experience_years = serializers.ReadOnlyField(source='get_experience_years')
    
    class Meta:
        model = Therapist
        fields = [
            'id', 'password', 'first_name', 'last_name', 'ssn', 'phone_no',
            'email', 'house_addr', 'work_addr', 'verified_certificates',
            'years_active', 'date_of_birth', 'sex', 'education',
            'profile_picture', 'area_of_expertise', 'about_note',
            'average_score', 'no_payment',
            'no_payment_patients', 'receive_emergency_messages',
            'can_send_emergency_messages', 'wallet_balance',
            'created_at', 'updated_at', 'age', 'full_name', 'experience_years'
        ]
        read_only_fields = ['created_at', 'updated_at', 'age', 'full_name', 'experience_years']
        extra_kwargs = {
            'password': {'write_only': True},
            'house_addr': {'required': False},
            'work_addr': {'required': False},
            'verified_certificates': {'required': False},
            'profile_picture': {'required': False},
            'area_of_expertise': {'required': False},
            'about_note': {'required': False},
            'no_payment_patients': {'required': False},
            'can_send_emergency_messages': {'required': False}
        }
    
    def create(self, validated_data):
        # Hash the password before saving
        password = validated_data.pop('password', None)
        therapist = super().create(validated_data)
        if password:
            therapist.password = password  # In production, you'd hash this
            therapist.save()
        return therapist
    
    def update(self, instance, validated_data):
        # Handle password update if provided
        password = validated_data.pop('password', None)
        therapist = super().update(instance, validated_data)
        if password:
            therapist.password = password  # In production, you'd hash this
            therapist.save()
        return therapist

class TherapistListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing therapists"""
    age = serializers.ReadOnlyField(source='get_age')
    full_name = serializers.ReadOnlyField(source='get_full_name')
    experience_years = serializers.ReadOnlyField(source='get_experience_years')
    
    class Meta:
        model = Therapist
        fields = [
            'id', 'first_name', 'last_name', 'phone_no', 'email',
            'years_active', 'date_of_birth', 'sex', 'education',
            'profile_picture', 'area_of_expertise', 'about_note',
            'average_score', 'no_payment', 'receive_emergency_messages',
            'created_at', 'age', 'full_name', 'experience_years'
        ]
        read_only_fields = ['created_at', 'age', 'full_name', 'experience_years']


class SessionSerializer(serializers.ModelSerializer):
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Session
        fields = [
            'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'scheduled_start_datetime', 'payment_stat', 'fee', 'status',
            'therapist_notes', 'patient_notes', 'duration', 'patient_rating',
            'patient_input', 'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'therapist_full_name', 'patient_full_name']
        extra_kwargs = {
            'therapist_notes': {'required': False},
            'patient_notes': {'required': False},
            'patient_rating': {'required': False},
            'patient_input': {'required': False}
        }

class SessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sessions"""
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Session
        fields = [
            'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'scheduled_start_datetime', 'status', 'fee', 'duration',
            'created_at', 'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['created_at', 'therapist_full_name', 'patient_full_name']


class PaymentSerializer(serializers.ModelSerializer):
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'session_id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'stat', 'fee', 'timestamp', 'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['timestamp', 'therapist_full_name', 'patient_full_name']

class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing payments"""
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'session_id', 'therapist_first_name', 'therapist_last_name',
            'patient_first_name', 'patient_last_name', 'stat', 'fee', 'timestamp',
            'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['timestamp', 'therapist_full_name', 'patient_full_name']


class ChatSerializer(serializers.ModelSerializer):
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Chat
        fields = [
            'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'status', 'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count',
            'therapist_notifications', 'patient_notifications',
            'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name',
            'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count'
        ]

class ChatListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chats"""
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Chat
        fields = [
            'id', 'therapist_first_name', 'therapist_last_name',
            'patient_first_name', 'patient_last_name', 'status',
            'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count', 'updated_at',
            'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = [
            'updated_at', 'therapist_full_name', 'patient_full_name',
            'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count'
        ]

class ChatDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for chat with additional information"""
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = [
            'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'status', 'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count',
            'therapist_notifications', 'patient_notifications',
            'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name',
            'other_participant', 'unread_count'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name',
            'last_message_text', 'last_message_timestamp', 'last_message_sender_id',
            'therapist_unread_count', 'patient_unread_count', 'other_participant', 'unread_count'
        ]
    
    def get_other_participant(self, obj):
        """Get the other participant in the chat"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # This would need to be adapted based on your user model
            user_id = getattr(request.user, 'id', None)
            if user_id:
                return obj.get_other_participant(str(user_id))
        return None
    
    def get_unread_count(self, obj):
        """Get unread count for the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_id = getattr(request.user, 'id', None)
            if user_id:
                return obj.get_unread_count(str(user_id))
        return 0

class MessageSerializer(serializers.ModelSerializer):
    reply_to_text = serializers.CharField(source='reply_to.text', read_only=True)
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_id', 'sender_id', 'text', 'emergency', 'message_type',
            'attachment_url', 'attachment_name', 'attachment_size',
            'read_status', 'read_at', 'read_by', 'reply_to', 'reply_to_text',
            'edited', 'edited_at', 'deleted', 'deleted_at', 'deleted_by',
            'timestamp', 'sender_name'
        ]
        read_only_fields = [
            'timestamp', 'read_at', 'read_by', 'edited_at', 'deleted_at', 'deleted_by',
            'reply_to_text', 'sender_name'
        ]
    
    def get_sender_name(self, obj):
        """Get sender's name"""
        try:
            # Try to get from Patient model
            from .models import Patient
            patient = Patient.objects.get(id=obj.sender_id)
            return patient.get_full_name()
        except Patient.DoesNotExist:
            try:
                # Try to get from Therapist model
                from .models import Therapist
                therapist = Therapist.objects.get(id=obj.sender_id)
                return therapist.get_full_name()
            except Therapist.DoesNotExist:
                return "Unknown User"

class MessageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing messages"""
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_id', 'sender_id', 'text', 'emergency', 'message_type',
            'read_status', 'reply_to', 'edited', 'deleted', 'timestamp', 'sender_name'
        ]
        read_only_fields = ['timestamp', 'sender_name']
    
    def get_sender_name(self, obj):
        """Get sender's name"""
        try:
            from .models import Patient
            patient = Patient.objects.get(id=obj.sender_id)
            return patient.get_full_name()
        except Patient.DoesNotExist:
            try:
                from .models import Therapist
                therapist = Therapist.objects.get(id=obj.sender_id)
                return therapist.get_full_name()
            except Therapist.DoesNotExist:
                return "Unknown User"

class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new messages"""
    
    class Meta:
        model = Message
        fields = [
            'chat_id', 'text', 'emergency', 'message_type',
            'attachment_url', 'attachment_name', 'attachment_size', 'reply_to'
        ]
    
    def validate(self, data):
        """Validate message data"""
        chat_id = data.get('chat_id')
        if not chat_id:
            raise serializers.ValidationError("Chat ID is required")
        
        # Check if chat exists
        try:
            from .models import Chat
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            raise serializers.ValidationError("Chat does not exist")
        
        # Check if user is participant in the chat
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_id = getattr(request.user, 'id', None)
            if user_id and str(user_id) not in [chat.therapist_id, chat.patient_id]:
                raise serializers.ValidationError("You are not a participant in this chat")
        
        return data

class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for ChatRoom model"""
    chat = ChatSerializer(read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'chat', 'room_type', 'therapist_can_send', 'patient_can_send',
            'therapist_can_see_history', 'patient_can_see_history',
            'description', 'tags', 'is_active', 'is_archived',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'chat']

class ChatRoomListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chat rooms"""
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'room_type', 'is_active', 'is_archived', 'updated_at'
        ]
        read_only_fields = ['updated_at']

class ReviewSerializer(serializers.ModelSerializer):
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Review
        fields = [
            'id', 'score', 'text', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
            'patient_first_name', 'patient_last_name', 'patient_id',
            'timestamp', 'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['timestamp', 'therapist_full_name', 'patient_full_name']
        extra_kwargs = {
            'text': {'required': False}
        }

class ReviewListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing reviews"""
    therapist_full_name = serializers.ReadOnlyField(source='get_therapist_full_name')
    patient_full_name = serializers.ReadOnlyField(source='get_patient_full_name')
    
    class Meta:
        model = Review
        fields = [
            'id', 'score', 'text', 'therapist_first_name', 'therapist_last_name',
            'patient_first_name', 'patient_last_name', 'timestamp',
            'therapist_full_name', 'patient_full_name'
        ]
        read_only_fields = ['timestamp', 'therapist_full_name', 'patient_full_name']


class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = [
            'id', 'author_id', 'front_note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'front_note': {'required': False}
        }

class NotebookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing notebooks"""
    class Meta:
        model = Notebook
        fields = [
            'id', 'author_id', 'front_note', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class PageSerializer(serializers.ModelSerializer):
    sorted_texts = serializers.ReadOnlyField(source='get_sorted_texts')
    
    class Meta:
        model = Page
        fields = [
            'id', 'notebook_id', 'title', 'text', 'sorted_texts', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'sorted_texts']

class PageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages"""
    class Meta:
        model = Page
        fields = [
            'id', 'notebook_id', 'title', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = [
            'id', 'therapist_id', 'date', 'time_slot', 'session_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class AvailabilityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = [
            'id', 'therapist_id', 'date', 'time_slot', 'session_id', 'updated_at'
        ]
        read_only_fields = ['updated_at']
