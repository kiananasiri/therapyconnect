# TherapyConnect Database Schema & Test Data Guide

## 📋 Database Schema Overview

The TherapyConnect application uses Django models to define the database structure. Here's a comprehensive breakdown of all the models and their relationships:

### 🧑‍⚕️ Patient Model (`patients` table)

**Primary Key**: Custom ID format `p_xxxxxx` (e.g., `p_abc123`)

| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| `id` | CharField(8) | Custom patient ID | ✅ | Format: `p_[a-z0-9]{6}` |
| `password` | CharField(64) | Patient password | ✅ | 8-64 characters |
| `first_name` | CharField(100) | Patient's first name | ✅ | Max 100 chars |
| `last_name` | CharField(100) | Patient's last name | ✅ | Max 100 chars |
| `ssn` | CharField(11) | Social Security Number | ❌ | Format: `XXX-XX-XXXX` |
| `phone_no` | CharField(15) | Phone number | ✅ | Unique, format: `+?1?\d{9,15}` |
| `email` | EmailField | Email address | ✅ | Unique |
| `address` | TextField | Home address | ❌ | - |
| `added_note` | TextField(500) | Additional notes | ❌ | Max 500 chars |
| `allergies_and_medication` | TextField | Medical information | ✅ | - |
| `date_of_birth` | DateField | Birth date | ✅ | - |
| `sex` | CharField(1) | Gender | ✅ | Choices: M/F/O/P |
| `profile_picture` | ImageField | Profile photo | ❌ | Upload to `patient_profiles/` |
| `about_note` | TextField(250) | About patient | ❌ | Max 250 chars |
| `tags` | JSONField | Patient tags | ❌ | Array of strings |
| `wallet_balance` | DecimalField | Account balance | ✅ | 0-1000, default: 0.00 |
| `created_at` | DateTimeField | Creation timestamp | ✅ | Auto-generated |
| `updated_at` | DateTimeField | Update timestamp | ✅ | Auto-updated |

### 👨‍⚕️ Therapist Model (`therapists` table)

**Primary Key**: Custom ID format `t_xxxxxx` (e.g., `t_abc123`)

| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| `id` | CharField(8) | Custom therapist ID | ✅ | Format: `t_[a-z0-9]{6}` |
| `password` | CharField(64) | Therapist password | ✅ | 8-64 characters |
| `first_name` | CharField(100) | Therapist's first name | ✅ | Max 100 chars |
| `last_name` | CharField(100) | Therapist's last name | ✅ | Max 100 chars |
| `ssn` | CharField(11) | Social Security Number | ✅ | Unique, format: `XXX-XX-XXXX` |
| `phone_no` | CharField(15) | Phone number | ✅ | Unique, format: `+?1?\d{9,15}` |
| `email` | EmailField | Email address | ✅ | - |
| `house_addr` | TextField | Home address | ❌ | - |
| `work_addr` | TextField | Work address | ❌ | - |
| `verified_certificates` | JSONField | Certifications | ❌ | Array of strings |
| `years_active` | PositiveIntegerField | Years of experience | ✅ | Default: 0 |
| `date_of_birth` | DateField | Birth date | ✅ | - |
| `sex` | CharField(1) | Gender | ✅ | Choices: M/F/O/P |
| `education` | JSONField | Education history | ✅ | Array of strings |
| `profile_picture` | ImageField | Profile photo | ❌ | Upload to `therapist_profiles/` |
| `area_of_expertise` | JSONField | Specialties | ❌ | Array of strings |
| `about_note` | TextField(300) | About therapist | ❌ | Max 300 chars |
| `average_score` | DecimalField(3,2) | Rating average | ✅ | Default: 0.00 |
| `no_payment` | BooleanField | Free sessions flag | ✅ | Default: False |
| `no_payment_patients` | JSONField | Free session patients | ❌ | Array of patient IDs |
| `receive_emergency_messages` | BooleanField | Emergency message flag | ✅ | Default: False |
| `can_send_emergency_messages` | JSONField | Emergency contacts | ❌ | Array of patient IDs |
| `wallet_balance` | DecimalField | Account balance | ✅ | Default: 0.00 |
| `created_at` | DateTimeField | Creation timestamp | ✅ | Auto-generated |
| `updated_at` | DateTimeField | Update timestamp | ✅ | Auto-updated |

### 📅 Session Model (`sessions` table)

**Primary Key**: Composite ID format `{therapist_id}_{patient_id}_{YYYYMMDD_HHMM}`

| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| `id` | CharField(50) | Composite session ID | ✅ | Generated format |
| `therapist_first_name` | CharField(100) | Therapist first name | ✅ | - |
| `therapist_last_name` | CharField(100) | Therapist last name | ✅ | - |
| `therapist_id` | CharField(8) | Therapist reference | ✅ | - |
| `patient_first_name` | CharField(100) | Patient first name | ✅ | - |
| `patient_last_name` | CharField(100) | Patient last name | ✅ | - |
| `patient_id` | CharField(8) | Patient reference | ✅ | - |
| `scheduled_start_datetime` | DateTimeField | Session start time | ✅ | - |
| `payment_stat` | CharField(20) | Payment status | ✅ | Default: 'pending' |
| `fee` | DecimalField | Session cost | ✅ | Default: 0.00 |
| `status` | CharField(20) | Session status | ✅ | Choices: scheduled/commencing/cancelled/completed |
| `therapist_notes` | TextField | Therapist's notes | ❌ | - |
| `patient_notes` | TextField | Patient's notes | ❌ | - |
| `duration` | PositiveIntegerField | Session length (minutes) | ✅ | Default: 60 |
| `patient_rating` | DecimalField(3,1) | Patient rating | ❌ | 0-10 in 0.5 steps |
| `patient_input` | TextField | Patient feedback | ❌ | - |
| `created_at` | DateTimeField | Creation timestamp | ✅ | Auto-generated |
| `updated_at` | DateTimeField | Update timestamp | ✅ | Auto-updated |

### 💳 Payment Model (`payments` table)

**Primary Key**: Format `PAY_{YYYYMMDD}_{random_string}`

| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| `id` | CharField(20) | Payment ID | ✅ | Generated format |
| `session_id` | CharField(50) | Related session | ✅ | References Session |
| `therapist_first_name` | CharField(100) | Therapist first name | ✅ | - |
| `therapist_last_name` | CharField(100) | Therapist last name | ✅ | - |
| `therapist_id` | CharField(8) | Therapist reference | ✅ | - |
| `patient_first_name` | CharField(100) | Patient first name | ✅ | - |
| `patient_last_name` | CharField(100) | Patient last name | ✅ | - |
| `patient_id` | CharField(8) | Patient reference | ✅ | - |
| `stat` | CharField(20) | Payment status | ✅ | Choices: unpaid/successful/unsuccessful/waived |
| `fee` | DecimalField | Payment amount | ✅ | - |
| `timestamp` | DateTimeField | Payment timestamp | ✅ | Auto-generated |

## 🔌 API Endpoints

### Patient APIs
- `GET /api/patients/` - List all patients
- `GET /api/patients/{id}/` - Get specific patient
- `POST /api/patients/` - Create new patient
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient

### Therapist APIs
- `GET /api/therapists/` - List all therapists
- `GET /api/therapists/{id}/` - Get specific therapist
- `GET /api/therapists/{id}/patients/` - Get therapist's patients
- `GET /api/therapists/{id}/calendar_sessions/` - Get calendar sessions
- `POST /api/therapists/` - Create new therapist
- `PUT /api/therapists/{id}/` - Update therapist

### Session APIs
- `GET /api/sessions/` - List all sessions
- `GET /api/sessions/{id}/` - Get specific session
- `POST /api/sessions/` - Create new session
- `PUT /api/sessions/{id}/` - Update session

### Payment APIs
- `GET /api/payments/` - List all payments
- `GET /api/payments/{id}/` - Get specific payment
- `POST /api/payments/` - Create new payment

## 🛠️ Test Data Scripts

I've created two Python scripts to populate your database with test data:

### 1. `add_test_data.py` - Comprehensive Test Data
**Purpose**: Creates a full set of realistic test data for the entire system.

**What it creates**:
- 6 diverse patients with realistic profiles
- 4 professional therapists with different specialties
- 20+ sessions (past and future) with proper relationships
- Payment records for completed sessions

**Usage**:
```bash
python add_test_data.py
```

### 2. `add_dashboard_data.py` - Dashboard-Specific Data
**Purpose**: Creates the exact data needed for your therapist dashboard to work.

**What it creates**:
- The specific therapist (`t_abc123`) used in your frontend
- 5 patients assigned to this therapist
- 20+ sessions spanning past and future dates
- Proper calendar data for the dashboard

**Usage**:
```bash
python add_dashboard_data.py
```

### 3. `setup_test_data.sh` - Automated Setup
**Purpose**: One-click setup that runs migrations and creates dashboard data.

**What it does**:
1. Runs Django database migrations
2. Creates the dashboard test data
3. Provides success confirmation and next steps

**Usage**:
```bash
./setup_test_data.sh
```

## 🎯 Dashboard Integration

The therapist dashboard (`TherapistDashboard.jsx`) uses these specific API calls:

1. **Therapist Profile**: `getTherapist(MOCK_THERAPIST_ID)`
   - Fetches therapist info for header and about section
   - Uses therapist ID: `t_abc123`

2. **Patient List**: `getTherapistPatients(MOCK_THERAPIST_ID)`
   - Shows all patients assigned to the therapist
   - Displays patient cards with session counts and tags

3. **Calendar Data**: `getTherapistCalendarSessions(MOCK_THERAPIST_ID, year, month)`
   - Populates the calendar with session information
   - Shows session counts per day and hover details

## 📊 Data Relationships

```
Therapist (t_abc123)
├── Has many Patients
│   ├── p_john01 (John Smith)
│   ├── p_sarah02 (Sarah Johnson)
│   ├── p_mike03 (Michael Brown)
│   ├── p_emily04 (Emily Davis)
│   └── p_david05 (David Wilson)
└── Has many Sessions
    ├── Past sessions (completed/cancelled)
    ├── Current sessions (scheduled)
    └── Future sessions (scheduled)
        └── Each session links to:
            ├── One Therapist
            ├── One Patient
            └── Optional Payment record
```

## 🚀 Getting Started

1. **Setup the database**:
   ```bash
   ./setup_test_data.sh
   ```

2. **Start the backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

4. **View the dashboard**: Navigate to the therapist dashboard and see real data populated from your database!

## 🔍 Verification

After running the setup, you can verify the data was created:

```bash
cd backend
python manage.py shell
```

```python
from therapy.models import Patient, Therapist, Session

# Check therapist
therapist = Therapist.objects.get(id='t_abc123')
print(f"Therapist: {therapist.get_full_name()}")

# Check patients
patients = Patient.objects.all()
print(f"Total patients: {patients.count()}")

# Check sessions
sessions = Session.objects.filter(therapist_id='t_abc123')
print(f"Sessions for therapist: {sessions.count()}")
```

This comprehensive setup ensures your therapist dashboard will display real, meaningful data that demonstrates all the features you've built! 🎉
