import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date, timedelta, datetime
from decimal import Decimal
from .models import (
    Patient, Therapist, Session, Payment, Chat, Message, ChatRoom,
    Availability, Review
)

class PatientModelTest(TestCase):
    def setUp(self):
        """Set up test data"""
        self.valid_patient_data = {
            'id': 'p_test01',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_no': '+1999999999',
            'email': 'test@example.com',
            'allergies_and_medication': 'None',
            'date_of_birth': date(1990, 1, 1),
            'sex': 'M'
        }
    
    def test_create_valid_patient(self):
        """Test creating a patient with valid data"""
        patient = Patient.objects.create(**self.valid_patient_data)
        self.assertEqual(patient.id, 'p_test01')
        self.assertEqual(patient.first_name, 'Test')
        self.assertEqual(patient.last_name, 'User')
        self.assertEqual(patient.phone_no, '+1999999999')
        self.assertEqual(patient.email, 'test@example.com')
    
    def test_patient_id_format_validation(self):
        """Test patient ID format"""
        valid_ids = ['p_abc123', 'p_123abc', 'p_abcdef']
        for i, valid_id in enumerate(valid_ids):
            patient_data = self.valid_patient_data.copy()
            patient_data['id'] = valid_id
            patient_data['phone_no'] = f'+199999999{i}'
            patient_data['email'] = f'test{i}@example.com'
            patient = Patient.objects.create(**patient_data)
            self.assertEqual(patient.id, valid_id)
        
        invalid_ids = ['abc123', 'p_ABC123', 'p_123', 'p_1234567']
        for i, invalid_id in enumerate(invalid_ids):
            patient_data = self.valid_patient_data.copy()
            patient_data['id'] = invalid_id
            patient_data['phone_no'] = f'+199999998{i}'
            patient_data['email'] = f'invalid{i}@example.com'
            with self.assertRaises(ValidationError):
                patient = Patient(**patient_data)
                patient.full_clean()
    
    def test_password_length_validation(self):
        """Test password min and max length"""
        valid_passwords = ['12345678', 'a' * 64]
        for i, password in enumerate(valid_passwords):
            patient_data = self.valid_patient_data.copy()
            patient_data['password'] = password
            patient_data['phone_no'] = f'+199999996{i}'
            patient_data['email'] = f'pass{i}@example.com'
            patient_data['id'] = f'p_test{4+i}'
            patient = Patient.objects.create(**patient_data)
            self.assertEqual(patient.password, password)
        
        invalid_passwords = ['short', 'a' * 65]
        for i, password in enumerate(invalid_passwords):
            patient_data = self.valid_patient_data.copy()
            patient_data['password'] = password
            patient_data['phone_no'] = f'+199999995{i}'
            patient_data['email'] = f'failpass{i}@example.com'
            patient_data['id'] = f'p_testX{i}'
            with self.assertRaises(ValidationError):
                patient = Patient(**patient_data)
                patient.full_clean()
    
    def test_phone_and_email_uniqueness(self):
        """Test uniqueness of phone number and email"""
        Patient.objects.create(**self.valid_patient_data)
        
        # Duplicate phone
        patient_data2 = self.valid_patient_data.copy()
        patient_data2['id'] = 'p_test10'
        patient_data2['email'] = 'unique@example.com'
        with self.assertRaises(Exception):
            Patient.objects.create(**patient_data2)
        
        # Duplicate email
        patient_data3 = self.valid_patient_data.copy()
        patient_data3['id'] = 'p_test11'
        patient_data3['phone_no'] = '+1888888888'
        with self.assertRaises(Exception):
            Patient.objects.create(**patient_data3)
    
    def test_ssn_format_validation(self):
        """Test SSN format"""
        patient_data = self.valid_patient_data.copy()
        patient_data['phone_no'] = '+1999999950'
        patient_data['email'] = 'ssn@example.com'
        patient_data['id'] = 'p_test20'
        
        patient_data['ssn'] = '123-45-6789'
        patient = Patient.objects.create(**patient_data)
        self.assertEqual(patient.ssn, '123-45-6789')
        
        invalid_ssns = ['123456789', '123-45-678', 'abc-def-ghij']
        for i, invalid_ssn in enumerate(invalid_ssns):
            patient_data = self.valid_patient_data.copy()
            patient_data['id'] = f'p_test{30+i}'
            patient_data['phone_no'] = f'+199999994{i}'
            patient_data['email'] = f'ssnfail{i}@example.com'
            patient_data['ssn'] = invalid_ssn
            with self.assertRaises(ValidationError):
                patient = Patient(**patient_data)
                patient.full_clean()
    
    def test_required_fields(self):
        """Test required fields must not be blank/null"""
        required_fields = ['id', 'password', 'first_name', 'last_name',
                          'phone_no', 'email', 'allergies_and_medication', 
                          'date_of_birth', 'sex']
        for i, field in enumerate(required_fields):
            patient_data = self.valid_patient_data.copy()
            patient_data['phone_no'] = f'+199999993{i}'
            patient_data['email'] = f'req{i}@example.com'
            patient_data['id'] = f'p_test{40+i}'
            patient_data[field] = '' if field not in ['id','date_of_birth'] else None
            with self.assertRaises(ValidationError):
                patient = Patient(**patient_data)
                patient.full_clean()
    
    def test_sex_choices(self):
        """Test sex field choices"""
        valid_sexes = ['M', 'F', 'O', 'P']
        for i, sex in enumerate(valid_sexes):
            patient_data = self.valid_patient_data.copy()
            patient_data['sex'] = sex
            patient_data['phone_no'] = f'+199999992{i}'
            patient_data['email'] = f'sex{i}@example.com'
            patient_data['id'] = f'p_test{50+i}'
            patient = Patient.objects.create(**patient_data)
            self.assertEqual(patient.sex, sex)
        
        patient_data = self.valid_patient_data.copy()
        patient_data['sex'] = 'X'
        patient_data['phone_no'] = '+1999999910'
        patient_data['email'] = 'invalidsex@example.com'
        patient_data['id'] = 'p_test60'
        patient = Patient(**patient_data)
        with self.assertRaises(ValidationError):
            patient.full_clean()
    
    def test_text_field_lengths(self):
        """Test max length for notes"""
        patient_data = self.valid_patient_data.copy()
        patient_data['id'] = 'p_test70'
        patient_data['phone_no'] = '+1999999900'
        patient_data['email'] = 'note@example.com'
        patient_data['added_note'] = 'a' * 500
        patient = Patient.objects.create(**patient_data)
        self.assertEqual(len(patient.added_note), 500)
        
        patient_data = self.valid_patient_data.copy()
        patient_data['id'] = 'p_test71'
        patient_data['phone_no'] = '+1999999899'
        patient_data['email'] = 'note2@example.com'
        patient_data['about_note'] = 'b' * 250
        patient = Patient.objects.create(**patient_data)
        self.assertEqual(len(patient.about_note), 250)
    
    def test_wallet_balance_validation(self):
        """Test wallet balance limits"""
        patient = Patient.objects.create(**self.valid_patient_data)
        self.assertEqual(patient.wallet_balance, Decimal('0.00'))
        
        patient.wallet_balance = Decimal('500.00')
        patient.full_clean()  # should be fine
        
        patient.wallet_balance = Decimal('-1')
        with self.assertRaises(ValidationError):
            patient.full_clean()
        
        patient.wallet_balance = Decimal('1001')
        with self.assertRaises(ValidationError):
            patient.full_clean()
    
    def test_methods(self):
        """Test model methods"""
        patient = Patient.objects.create(**self.valid_patient_data)
        self.assertEqual(patient.get_full_name(), 'Test User')
        expected_age = date.today().year - 1990
        self.assertTrue(expected_age - 1 <= patient.get_age() <= expected_age + 1)
        self.assertEqual(str(patient), 'Test User (p_test01)')
        # Default avatar check
        self.assertEqual(patient.get_default_profile_picture(), 'default_male_avatar.png')
        # can_update_field logic
        self.assertFalse(patient.can_update_field('ssn'))
        self.assertTrue(patient.can_update_field('first_name'))
    
    def test_adjust_balance(self):
        """Test balance adjustments"""
        patient = Patient.objects.create(**self.valid_patient_data)
        patient.adjust_balance(100)
        self.assertEqual(patient.wallet_balance, Decimal('100.00'))
        
        with self.assertRaises(ValueError):
            patient.adjust_balance(-200)
        
        with self.assertRaises(ValueError):
            patient.adjust_balance(1000)


# -----------------------------
# THERAPIST MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestTherapistModel:
    def test_create_valid_therapist(self):
        therapist = Therapist.objects.create(
            id="t_abc123",
            password="StrongPass123!",
            first_name="John",
            last_name="Doe",
            ssn="123-45-6789",
            phone_no="+12345678901",
            email="john.doe@example.com",
            date_of_birth=date(1990, 1, 1),
            sex="M",
            education=[{"degree": "PhD", "field": "Psychology"}]
        )
        assert therapist.get_full_name() == "John Doe"
        assert therapist.get_age() > 20
        assert str(therapist) == "John Doe (t_abc123)"

    def test_invalid_id_format(self):
        therapist = Therapist(
            id="wrong123",
            password="StrongPass123!",
            first_name="Jane",
            last_name="Doe",
            ssn="987-65-4321",
            phone_no="+19876543210",
            email="jane.doe@example.com",
            date_of_birth=date(1985, 5, 5),
            sex="F",
            education=[]
        )
        with pytest.raises(ValidationError):
            therapist.full_clean()

    def test_adjust_balance(self):
        therapist = Therapist.objects.create(
            id="t_xyz789",
            password="Pass12345",
            first_name="Alice",
            last_name="Smith",
            ssn="111-22-3333",
            phone_no="+1112223333",
            email="alice.smith@example.com",
            date_of_birth=date(1980, 7, 7),
            sex="F",
            education=[]
        )
        therapist.adjust_balance(100.50)
        assert therapist.wallet_balance == 100.50


# -----------------------------
# SESSION MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestSessionModel:
    def test_can_be_reserved_valid_window(self):
        start_time = timezone.now() + timedelta(days=2)
        session = Session.objects.create(
            id="t_abc123_p_123456_20250101_1200",
            therapist_first_name="John",
            therapist_last_name="Doe",
            therapist_id="t_abc123",
            patient_first_name="Bob",
            patient_last_name="Smith",
            patient_id="p_123456",
            scheduled_start_datetime=start_time
        )
        assert session.can_be_reserved() is True

    def test_cannot_be_reserved_past_window(self):
        start_time = timezone.now() + timedelta(hours=12)
        session = Session.objects.create(
            id="t_abc123_p_123456_20250101_1200",
            therapist_first_name="John",
            therapist_last_name="Doe",
            therapist_id="t_abc123",
            patient_first_name="Bob",
            patient_last_name="Smith",
            patient_id="p_123456",
            scheduled_start_datetime=start_time
        )
        assert session.can_be_reserved() is False

    def test_is_join_button_active(self):
        start_time = timezone.now() + timedelta(minutes=5)
        session = Session.objects.create(
            id="t_abc123_p_123456_20250101_1200",
            therapist_first_name="John",
            therapist_last_name="Doe",
            therapist_id="t_abc123",
            patient_first_name="Bob",
            patient_last_name="Smith",
            patient_id="p_123456",
            scheduled_start_datetime=start_time
        )
        assert session.is_join_button_active() is True


# -----------------------------
# PAYMENT MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestPaymentModel:
    def test_create_payment(self):
        payment = Payment.objects.create(
            id="PAY123",
            session_id="t_abc123_p_123456_20250101_1200",
            amount=50.0,
            payment_method="credit_card",
            status="completed"
        )
        assert str(payment) == "Payment PAY123 - completed"

    def test_invalid_payment_amount(self):
        payment = Payment(
            id="PAY999",
            session_id="s123",
            amount=-10.0,
            payment_method="paypal",
            status="pending"
        )
        with pytest.raises(ValidationError):
            payment.full_clean()


# -----------------------------
# CHAT MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestChatModel:
    def test_create_chat(self):
        chat = Chat.objects.create(
            id="CHAT_t_abc123_p_123456",
            therapist_id="t_abc123",
            patient_id="p_123456",
            status="active"
        )
        assert str(chat) == "Chat between t_abc123 and p_123456"


# -----------------------------
# MESSAGE MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestMessageModel:
    def test_mark_as_read(self):
        msg = Message.objects.create(
            id="MSG_20250101_abc",
            chat_id="CHAT_t_abc123_p_123456",
            sender_id="t_abc123",
            text="Hello",
        )
        msg.mark_as_read("p_123456")
        assert msg.read_status == "read"
        assert msg.read_by == "p_123456"

    def test_edit_message(self):
        msg = Message.objects.create(
            id="MSG_20250101_xyz",
            chat_id="CHAT_t_abc123_p_123456",
            sender_id="t_abc123",
            text="Old text",
        )
        msg.edit_message("New text")
        assert msg.text == "New text"
        assert msg.edited is True

    def test_emergency_message_limit(self):
        chat_id = "CHAT_t_abc123_p_123456"
        sender_id = "t_abc123"
        for i in range(15):
            Message.objects.create(
                id=f"MSG_20250101_{i}",
                chat_id=chat_id,
                sender_id=sender_id,
                text="Emergency",
                emergency=True
            )
        assert Message.can_send_emergency_message(sender_id, chat_id) is False


# -----------------------------
# CHATROOM MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestChatRoomModel:
    def test_create_chatroom(self):
        chatroom = ChatRoom.objects.create(
            id="ROOM1",
            therapist_id="t_abc123",
            patient_id="p_123456",
            created_at=timezone.now()
        )
        assert str(chatroom) == "ChatRoom ROOM1"


# -----------------------------
# AVAILABILITY MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestAvailabilityModel:
    def test_create_availability(self):
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
        availability = Availability.objects.create(
            id="AVAIL1",
            therapist_id="t_abc123",
            start_datetime=start_time,
            end_datetime=end_time
        )
        assert str(availability) == "Availability AVAIL1"

    def test_invalid_availability_times(self):
        start_time = timezone.now()
        end_time = start_time - timedelta(hours=1)
        availability = Availability(
            id="AVAIL2",
            therapist_id="t_abc123",
            start_datetime=start_time,
            end_datetime=end_time
        )
        with pytest.raises(ValidationError):
            availability.full_clean()


# -----------------------------
# REVIEW MODEL TESTS
# -----------------------------

@pytest.mark.django_db
class TestReviewModel:
    def test_create_review(self):
        review = Review.objects.create(
            id="REV1",
            session_id="s123",
            rating=5,
            comments="Great session!",
            reviewer_id="p_123456"
        )
        assert str(review) == "Review REV1 - Rating: 5"

    def test_invalid_rating(self):
        review = Review(
            id="REV2",
            session_id="s456",
            rating=10,
            comments="Too high rating",
            reviewer_id="p_123456"
        )
        with pytest.raises(ValidationError):
            review.full_clean()