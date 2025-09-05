from django.contrib import admin
from .models import Patient, Therapist, Session, Payment, Chat, Message, Review, Notebook, Page

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'first_name', 'last_name', 'phone_no', 'email',
        'date_of_birth', 'sex', 'wallet_balance', 'created_at'
    ]
    
    list_filter = [
        'sex', 'date_of_birth', 'created_at', 'tags'
    ]
    
    search_fields = [
        'id', 'first_name', 'last_name', 'phone_no', 'email', 'ssn'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'age', 'full_name'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'password', 'first_name', 'last_name', 'date_of_birth', 'sex')
        }),
        ('Contact Information', {
            'fields': ('phone_no', 'email', 'address')
        }),
        ('Medical Information', {
            'fields': ('ssn', 'allergies_and_medication')
        }),
        ('Additional Information', {
            'fields': ('added_note', 'about_note', 'profile_picture')
        }),
        ('System Fields', {
            'fields': ('tags', 'wallet_balance', 'sessions', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def age(self, obj):
        return obj.get_age()
    age.short_description = 'Age'
    
    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Full Name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def save_model(self, request, obj, form, change):
        # In production, you'd hash the password here
        super().save_model(request, obj, form, change)


@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'first_name', 'last_name', 'phone_no', 'email',
        'years_active', 'average_score', 'no_payment', 'receive_emergency_messages',
        'wallet_balance', 'created_at'
    ]
    
    list_filter = [
        'sex', 'date_of_birth', 'years_active', 'no_payment', 
        'receive_emergency_messages', 'created_at'
    ]
    
    search_fields = [
        'id', 'first_name', 'last_name', 'phone_no', 'email', 'ssn'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'age', 'full_name', 'experience_years'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'password', 'first_name', 'last_name', 'date_of_birth', 'sex')
        }),
        ('Contact Information', {
            'fields': ('phone_no', 'email', 'house_addr', 'work_addr')
        }),
        ('Professional Information', {
            'fields': ('ssn', 'verified_certificates', 'years_active', 'education', 'area_of_expertise')
        }),
        ('Availability & Rating', {
            'fields': ('availability', 'average_score')
        }),
        ('Payment & Emergency', {
            'fields': ('no_payment', 'no_payment_patients', 'receive_emergency_messages', 'can_send_emergency_messages')
        }),
        ('Additional Information', {
            'fields': ('about_note', 'profile_picture')
        }),
        ('System Fields', {
            'fields': ('wallet_balance', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def age(self, obj):
        return obj.get_age()
    age.short_description = 'Age'
    
    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Full Name'
    
    def experience_years(self, obj):
        return obj.get_experience_years()
    experience_years.short_description = 'Total Experience Years'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def save_model(self, request, obj, form, change):
        # In production, you'd hash the password here
        super().save_model(request, obj, form, change)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'therapist_first_name', 'therapist_last_name', 'patient_first_name', 'patient_last_name',
        'scheduled_start_datetime', 'status', 'fee', 'duration', 'created_at'
    ]
    
    list_filter = [
        'status', 'payment_stat', 'scheduled_start_datetime', 'created_at'
    ]
    
    search_fields = [
        'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
        'patient_first_name', 'patient_last_name', 'patient_id'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name'
    ]
    
    fieldsets = (
        ('Session Information', {
            'fields': ('id', 'scheduled_start_datetime', 'status', 'duration', 'fee', 'payment_stat')
        }),
        ('Therapist Information', {
            'fields': ('therapist_id', 'therapist_first_name', 'therapist_last_name')
        }),
        ('Patient Information', {
            'fields': ('patient_id', 'patient_first_name', 'patient_last_name')
        }),
        ('Session Notes', {
            'fields': ('therapist_notes', 'patient_notes', 'patient_rating', 'patient_input')
        }),
        ('System Fields', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def therapist_full_name(self, obj):
        return obj.get_therapist_full_name()
    therapist_full_name.short_description = 'Therapist Full Name'
    
    def patient_full_name(self, obj):
        return obj.get_patient_full_name()
    patient_full_name.short_description = 'Patient Full Name'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'session_id', 'therapist_first_name', 'therapist_last_name',
        'patient_first_name', 'patient_last_name', 'stat', 'fee', 'timestamp'
    ]
    
    list_filter = [
        'stat', 'timestamp'
    ]
    
    search_fields = [
        'id', 'session_id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
        'patient_first_name', 'patient_last_name', 'patient_id'
    ]
    
    readonly_fields = [
        'timestamp', 'therapist_full_name', 'patient_full_name'
    ]
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('id', 'session_id', 'stat', 'fee', 'timestamp')
        }),
        ('Therapist Information', {
            'fields': ('therapist_id', 'therapist_first_name', 'therapist_last_name')
        }),
        ('Patient Information', {
            'fields': ('patient_id', 'patient_first_name', 'patient_last_name')
        }),
    )
    
    def therapist_full_name(self, obj):
        return obj.get_therapist_full_name()
    therapist_full_name.short_description = 'Therapist Full Name'
    
    def patient_full_name(self, obj):
        return obj.get_patient_full_name()
    patient_full_name.short_description = 'Patient Full Name'


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'therapist_first_name', 'therapist_last_name',
        'patient_first_name', 'patient_last_name', 'updated_at'
    ]
    
    list_filter = [
        'created_at', 'updated_at'
    ]
    
    search_fields = [
        'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
        'patient_first_name', 'patient_last_name', 'patient_id'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'therapist_full_name', 'patient_full_name'
    ]
    
    fieldsets = (
        ('Chat Information', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
        ('Therapist Information', {
            'fields': ('therapist_id', 'therapist_first_name', 'therapist_last_name')
        }),
        ('Patient Information', {
            'fields': ('patient_id', 'patient_first_name', 'patient_last_name')
        }),
    )
    
    def therapist_full_name(self, obj):
        return obj.get_therapist_full_name()
    therapist_full_name.short_description = 'Therapist Full Name'
    
    def patient_full_name(self, obj):
        return obj.get_patient_full_name()
    patient_full_name.short_description = 'Patient Full Name'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'chat_id', 'sender_id', 'text', 'emergency', 'timestamp'
    ]
    
    list_filter = [
        'emergency', 'timestamp'
    ]
    
    search_fields = [
        'id', 'chat_id', 'sender_id', 'text'
    ]
    
    readonly_fields = [
        'timestamp'
    ]
    
    fieldsets = (
        ('Message Information', {
            'fields': ('id', 'chat_id', 'sender_id', 'text', 'emergency', 'timestamp')
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'score', 'therapist_first_name', 'therapist_last_name',
        'patient_first_name', 'patient_last_name', 'timestamp'
    ]
    
    list_filter = [
        'score', 'timestamp'
    ]
    
    search_fields = [
        'id', 'therapist_first_name', 'therapist_last_name', 'therapist_id',
        'patient_first_name', 'patient_last_name', 'patient_id', 'text'
    ]
    
    readonly_fields = [
        'timestamp', 'therapist_full_name', 'patient_full_name'
    ]
    
    fieldsets = (
        ('Review Information', {
            'fields': ('id', 'score', 'text', 'timestamp')
        }),
        ('Therapist Information', {
            'fields': ('therapist_id', 'therapist_first_name', 'therapist_last_name')
        }),
        ('Patient Information', {
            'fields': ('patient_id', 'patient_first_name', 'patient_last_name')
        }),
    )
    
    def therapist_full_name(self, obj):
        return obj.get_therapist_full_name()
    therapist_full_name.short_description = 'Therapist Full Name'
    
    def patient_full_name(self, obj):
        return obj.get_patient_full_name()
    patient_full_name.short_description = 'Patient Full Name'


@admin.register(Notebook)
class NotebookAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'author_id', 'front_note', 'updated_at'
    ]
    
    list_filter = [
        'created_at', 'updated_at'
    ]
    
    search_fields = [
        'id', 'author_id', 'front_note'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Notebook Information', {
            'fields': ('id', 'author_id', 'front_note', 'created_at', 'updated_at')
        }),
    )


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'notebook_id', 'title', 'updated_at'
    ]
    
    list_filter = [
        'created_at', 'updated_at'
    ]
    
    search_fields = [
        'id', 'notebook_id', 'title'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'sorted_texts'
    ]
    
    fieldsets = (
        ('Page Information', {
            'fields': ('id', 'notebook_id', 'title', 'text', 'sorted_texts', 'created_at', 'updated_at')
        }),
    )
    
    def sorted_texts(self, obj):
        return obj.get_sorted_texts()
    sorted_texts.short_description = 'Sorted Texts'
