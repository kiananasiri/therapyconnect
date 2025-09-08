# SE2

🔑 Environment Variables

This project requires environment variables for both backend (Django) and frontend (React).
Real .env files should not be committed to GitHub.
Instead, copy the provided *.example files and fill in your own values.

📂 Backend (backend/.env)

Create a .env file in the backend/ directory:

# Django settings
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database
POSTGRES_DB=therapy_db
POSTGRES_USER=postgres_user
POSTGRES_PASSWORD=postgres_password
DB_HOST=db
DB_PORT=5432

# Social authentication (Google OAuth2)
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=your-google-client-id
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=your-google-client-secret


👉 Notes:

SECRET_KEY can be generated with:

python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"


To get SOCIAL_AUTH_GOOGLE_OAUTH2_KEY and SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET, create credentials in the Google Cloud Console
.

📂 Frontend (frontend/.env.production)

Create a .env.production file in the frontend/ directory:

# Backend API URL (replace with your server/domain)
REACT_APP_BACKEND_URL=http://your-server-ip:8000/api


👉 Notes:

This value is public (embedded in the frontend build).

Do not put secrets here.

If deploying to a domain, use:

REACT_APP_BACKEND_URL=https://yourdomain.com/api

⚠️ Git Ignore Rules

Add the following lines to .gitignore so your secrets are never pushed:

# Ignore environment files
backend/.env
frontend/.env.production


Instead, provide safe examples:

backend/.env.example
frontend/.env.production.example