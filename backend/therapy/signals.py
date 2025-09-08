from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Q

from therapy.models import (
    Patient,
    Therapist,
    Session,
    Payment,
    Chat,
    Message,
    ChatRoom,
    Availability,
    Review,
)


@receiver(post_migrate)
def create_seed_data(sender, **kwargs):
    if sender.name != "therapy":
        return

    # Utility to deterministically generate a static password per object id (debug only)
    def generate_static_password(object_id: str) -> str:
        return f"{object_id}_Pass123!"

    # -------------------
    # Patients
    # -------------------
    patients = [
        {
            "id": "p_abc123",
            "password": "Pass12345!",
            "first_name": "Alice",
            "last_name": "Smith",
            "phone_no": "09100000001",
            "email": "alice@example.com",
            "allergies_and_medication": "None",
            "date_of_birth": date(1990, 1, 1),
            "sex": "F",
        },
        {
            "id": "p_def456",
            "password": "Secret987!",
            "first_name": "Bob",
            "last_name": "Johnson",
            "phone_no": "09100000002",
            "email": "bob@example.com",
            "allergies_and_medication": "Penicillin",
            "date_of_birth": date(1988, 5, 10),
            "sex": "M",
        },
        {
            "id": "p_ghi789",
            "password": "SafePass321",
            "first_name": "Charlie",
            "last_name": "Lee",
            "phone_no": "09100000003",
            "email": "charlie@example.com",
            "allergies_and_medication": "Ibuprofen",
            "date_of_birth": date(1995, 12, 20),
            "sex": "O",
        },
    ]
    for pdata in patients:
        Patient.objects.update_or_create(id=pdata["id"], defaults=pdata)

    # Backfill passwords for any existing patients missing/empty passwords
    for patient in Patient.objects.filter(Q(password__isnull=True) | Q(password="")):
        patient.password = generate_static_password(patient.id)
        patient.save(update_fields=["password"])

    # -------------------
    # Therapists
    # -------------------
    therapists = [
        {
            "id": "t_abc123",
            "password": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
            "ssn": "123-45-6789",
            "phone_no": "09200000001",
            "email": "john@example.com",
            "date_of_birth": date(1980, 6, 15),
            "sex": "M",
            "education": [{"degree": "PhD", "field": "Psychology"}],
            "wallet_balance": Decimal("200.00"),
        },
        {
            "id": "t_def456",
            "password": "TherapistPass!",
            "first_name": "Jane",
            "last_name": "Miller",
            "ssn": "987-65-4321",
            "phone_no": "09200000002",
            "email": "jane@example.com",
            "date_of_birth": date(1982, 7, 22),
            "sex": "F",
            "education": [{"degree": "MSc", "field": "Counseling"}],
            "wallet_balance": Decimal("150.00"),
        },
        {
            "id": "t_ghi789",
            "password": "TherapyRocks1",
            "first_name": "Sam",
            "last_name": "Williams",
            "ssn": "555-44-3333",
            "phone_no": "09200000003",
            "email": "sam@example.com",
            "date_of_birth": date(1975, 11, 5),
            "sex": "O",
            "education": [{"degree": "MA", "field": "Therapy"}],
            "wallet_balance": Decimal("300.00"),
        },
    ]
    for tdata in therapists:
        Therapist.objects.update_or_create(id=tdata["id"], defaults=tdata)

    # Backfill passwords for any existing therapists missing/empty passwords
    for therapist in Therapist.objects.filter(Q(password__isnull=True) | Q(password="")):
        therapist.password = generate_static_password(therapist.id)
        therapist.save(update_fields=["password"])

    # -------------------
    # Sessions
    # -------------------
    sessions = [
        {
            "id": "s1",
            "therapist_id": "t_abc123",
            "therapist_first_name": "John",
            "therapist_last_name": "Doe",
            "patient_id": "p_abc123",
            "patient_first_name": "Alice",
            "patient_last_name": "Smith",
            "scheduled_start_datetime": timezone.now() + timedelta(days=1),
            "status": "scheduled",
        },
        {
            "id": "s2",
            "therapist_id": "t_def456",
            "therapist_first_name": "Jane",
            "therapist_last_name": "Miller",
            "patient_id": "p_def456",
            "patient_first_name": "Bob",
            "patient_last_name": "Johnson",
            "scheduled_start_datetime": timezone.now() + timedelta(days=2),
            "status": "completed",
        },
        {
            "id": "s3",
            "therapist_id": "t_ghi789",
            "therapist_first_name": "Sam",
            "therapist_last_name": "Williams",
            "patient_id": "p_ghi789",
            "patient_first_name": "Charlie",
            "patient_last_name": "Lee",
            "scheduled_start_datetime": timezone.now() + timedelta(days=3),
            "status": "cancelled",
        },
    ]
    for sdata in sessions:
        Session.objects.update_or_create(id=sdata["id"], defaults=sdata)

    # -------------------
    # Payments
    # -------------------
    payments = [
        {
            "id": "pay1", 
            "session_id": "s1", 
            "therapist_first_name": "John",
            "therapist_last_name": "Doe",
            "therapist_id": "t_abc123",
            "patient_first_name": "Alice",
            "patient_last_name": "Smith",
            "patient_id": "p_abc123",
            "stat": "successful",
            "fee": 75.0
        },
        {
            "id": "pay2", 
            "session_id": "s2", 
            "therapist_first_name": "Jane",
            "therapist_last_name": "Miller",
            "therapist_id": "t_def456",
            "patient_first_name": "Bob",
            "patient_last_name": "Johnson",
            "patient_id": "p_def456",
            "stat": "successful",
            "fee": 100.0
        },
        {
            "id": "pay3", 
            "session_id": "s3", 
            "therapist_first_name": "Sam",
            "therapist_last_name": "Williams",
            "therapist_id": "t_ghi789",
            "patient_first_name": "Charlie",
            "patient_last_name": "Lee",
            "patient_id": "p_ghi789",
            "stat": "unsuccessful",
            "fee": 50.0
        },
    ]
    for pdata in payments:
        Payment.objects.update_or_create(id=pdata["id"], defaults=pdata)

    # -------------------
    # Chats + Messages
    # -------------------
    chats = [
        {"id": "chat1", "therapist_id": "t_abc123", "patient_id": "p_abc123", "status": "active"},
        {"id": "chat2", "therapist_id": "t_def456", "patient_id": "p_def456", "status": "active"},
    ]
    for cdata in chats:
        chat, _ = Chat.objects.update_or_create(id=cdata["id"], defaults=cdata)

        # Messages per chat
        Message.objects.update_or_create(
            id=f"msg_{cdata['id']}_1",
            defaults={"chat_id": chat.id, "sender_id": cdata["therapist_id"], "text": "Welcome to the session"},
        )
        Message.objects.update_or_create(
            id=f"msg_{cdata['id']}_2",
            defaults={"chat_id": chat.id, "sender_id": cdata["patient_id"], "text": "Thank you!"},
        )

    # -------------------
    # ChatRooms
    # -------------------
    # Get the chats we created earlier
    chat1 = Chat.objects.get(id="chat1")
    chat2 = Chat.objects.get(id="chat2")
    
    chatrooms = [
        {"id": "room1", "chat": chat1, "room_type": "therapy"},
        {"id": "room2", "chat": chat2, "room_type": "therapy"},
    ]
    for rdata in chatrooms:
        ChatRoom.objects.update_or_create(
            id=rdata["id"],
            defaults=rdata,
        )

    # -------------------
    # Availability
    # -------------------
    availabilities = [
        {"id": "av1", "therapist_id": "t_abc123", "date": date.today() + timedelta(days=1), "time_slot": "10-11"},
        {"id": "av2", "therapist_id": "t_def456", "date": date.today() + timedelta(days=2), "time_slot": "11-12"},
        {"id": "av3", "therapist_id": "t_ghi789", "date": date.today() + timedelta(days=3), "time_slot": "12-13"},
    ]
    for adata in availabilities:
        Availability.objects.update_or_create(
            id=adata["id"],
            defaults=adata,
        )

    # -------------------
    # Reviews
    # -------------------
    reviews = [
        {
            "id": "rev1", 
            "score": 5.0, 
            "text": "Great session!", 
            "therapist_first_name": "John",
            "therapist_last_name": "Doe",
            "therapist_id": "t_abc123",
            "patient_first_name": "Alice",
            "patient_last_name": "Smith",
            "patient_id": "p_abc123"
        },
        {
            "id": "rev2", 
            "score": 4.0, 
            "text": "Very helpful", 
            "therapist_first_name": "Jane",
            "therapist_last_name": "Miller",
            "therapist_id": "t_def456",
            "patient_first_name": "Bob",
            "patient_last_name": "Johnson",
            "patient_id": "p_def456"
        },
        {
            "id": "rev3", 
            "score": 2.0, 
            "text": "Session was cancelled", 
            "therapist_first_name": "Sam",
            "therapist_last_name": "Williams",
            "therapist_id": "t_ghi789",
            "patient_first_name": "Charlie",
            "patient_last_name": "Lee",
            "patient_id": "p_ghi789"
        },
    ]
    for rdata in reviews:
        Review.objects.update_or_create(id=rdata["id"], defaults=rdata)
