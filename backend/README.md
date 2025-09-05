# TherapyConnect Backend

This is the Django backend for the TherapyConnect application, featuring a PostgreSQL database with a comprehensive Patient model.

## Database Setup

### PostgreSQL Configuration

The application uses PostgreSQL 15 as the database. The configuration is defined in `docker-compose.yml`:

```yaml
db:
  image: postgres:15
  ports:
    - "5432:5432"
  environment:
    POSTGRES_DB: therapy_db
    POSTGRES_USER: mmd
    POSTGRES_PASSWORD: mmd
```

### Django Database Settings

The database connection is configured in `backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'therapy_db',
        'USER': 'mmd',
        'PASSWORD': 'mmd',
        'HOST': 'db',
        'PORT': '5432',
    }
}
```

## Patient Model

The Patient model is the core entity with the following attributes:

### Required Fields
- **id**: Custom format `p_xxxxxx` where x is lowercase alphanumeric (unique, primary key)
- **password**: 8-64 characters
- **first_name**: Patient's first name
- **last_name**: Patient's last name
- **phone_no**: Unique phone number (9-15 digits)
- **allergies_and_medication**: Text field for medical information
- **date_of_birth**: Patient's birth date
- **sex**: Choice field (M/F/O/P)

### Optional Fields
- **ssn**: Social Security Number (format: XXX-XX-XXXX)
- **email**: Patient's email address
- **address**: Patient's address
- **added_note**: Additional notes (max 500 characters)
- **profile_picture**: Profile image upload
- **about_note**: About section (max 250 characters)
- **tags**: JSON array for categorization
- **wallet_balance**: Decimal field for financial tracking
- **sessions**: JSON array for session history

### Auto-generated Fields
- **created_at**: Timestamp when record was created
- **updated_at**: Timestamp when record was last updated

## API Endpoints

The Patient model provides comprehensive REST API endpoints:

### Base URL: `/api/patients/`

- **GET** `/api/patients/` - List all patients (with filtering)
- **POST** `/api/patients/` - Create a new patient
- **GET** `/api/patients/{id}/` - Retrieve a specific patient
- **PUT** `/api/patients/{id}/` - Update a patient (full update)
- **PATCH** `/api/patients/{id}/` - Update a patient (partial update)
- **DELETE** `/api/patients/{id}/` - Delete a patient

### Custom Actions

- **POST** `/api/patients/{id}/add_tag/` - Add a tag to a patient
- **POST** `/api/patients/{id}/remove_tag/` - Remove a tag from a patient
- **POST** `/api/patients/{id}/add_session/` - Add a session to a patient
- **POST** `/api/patients/{id}/update_wallet/` - Update wallet balance

### Query Parameters for Filtering

- `?name=john` - Filter by first or last name
- `?phone=123` - Filter by phone number
- `?email=john@example.com` - Filter by email

## Getting Started

### 1. Start the Services

```bash
docker-compose up -d
```

### 2. Run Migrations

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### 3. Create a Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 4. Run Tests

```bash
docker-compose exec backend python manage.py test
```

## Model Validation

### Patient ID Format
- Must start with `p_`
- Followed by exactly 6 lowercase alphanumeric characters
- Examples: `p_abc123`, `p_123abc`, `p_abcdef`

### Password Requirements
- Minimum length: 8 characters
- Maximum length: 64 characters

### Phone Number Format
- Must be 9-15 digits
- Can include country code (e.g., +1234567890)

### SSN Format
- Must follow XXX-XX-XXXX pattern
- Only digits and hyphens allowed

### Text Field Limits
- `added_note`: Maximum 500 characters
- `about_note`: Maximum 250 characters

## Admin Interface

The Patient model is fully integrated with Django's admin interface, providing:

- List view with search and filtering
- Detailed form with field grouping
- Validation and error handling
- Bulk operations

## Security Considerations

### Password Handling
- In production, implement proper password hashing
- Consider using Django's built-in password validation
- Implement password reset functionality

### Data Privacy
- SSN and medical information should be encrypted
- Implement proper access controls
- Consider HIPAA compliance requirements

### API Security
- Implement proper authentication and authorization
- Use HTTPS in production
- Implement rate limiting

## Future Enhancements

### Planned Features
- Patient search and advanced filtering
- Medical history tracking
- Appointment scheduling
- Payment processing integration
- Document upload and management

### Database Optimizations
- Add database indexes for frequently queried fields
- Implement database partitioning for large datasets
- Add full-text search capabilities

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL container is running
   - Verify database credentials in settings.py
   - Check network connectivity between containers

2. **Migration Errors**
   - Ensure database is accessible
   - Check for conflicting migrations
   - Consider resetting database if in development

3. **Validation Errors**
   - Verify data format requirements
   - Check field constraints
   - Review model validation rules

### Logs

View application logs:
```bash
docker-compose logs backend
```

View database logs:
```bash
docker-compose logs db
```

## Contributing

1. Follow Django coding standards
2. Write tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

This project is proprietary software. All rights reserved.
