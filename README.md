
# 🎨 MiTaller.art

Marketplace SaaS para artesanos de Menorca - Conectando tradición con tecnología.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15 (via Docker)
- Git

### Setup Backend (Django)
```bash
cd backend
docker-compose up -d  # PostgreSQL
cp .env.example .env  # Configurar variables
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000

Setup Frontend (Next.js)
bashcd frontend
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3000
📁 Project Structure
mitaller/
├── backend/          # Django REST API
├── frontend/         # Next.js App
├── .cursorrules      # Cursor AI configuration
└── README.md         # This file
🛠️ Tech Stack
Backend: Django 5 + DRF + PostgreSQL
Frontend: Next.js 15 + TypeScript + Tailwind
Auth: JWT
Payments: Stripe Connect (coming soon)
Deploy: Railway + Vercel

📚 Documentation

Roadmap - Development plan
Architecture - Technical details

🤝 Contributing
Este es un proyecto en desarrollo activo. Por ahora, solo yo (solopreneur).
📄 License
Proprietary - Todos los derechos reservados