# Demetri & Mahdi — Backend

## Folder Structure
```
project/
├── backend/          ← Express (Node.js) API
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── schema.sql
│   ├── .env.example  ← copy to .env and fill in your values
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mail.js
│   │   └── scan.js
│   └── middleware/
│       └── auth.js
│
└── ml_service/       ← FastAPI (Python) ML model server
    ├── main.py
    └── model.pkl     ← COPY YOUR TRAINED MODEL HERE
```

## Setup Order

### 1. Database
```bash
mariadb -u root -p < backend/schema.sql
```

### 2. ML Service
Copy your model.pkl into ml_service/, then:
```bash
cd ml_service
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# edit .env with your DB password and JWT secret
npm install
npm run dev
```

### 4. Frontend
Your existing React app — just make sure API calls point to http://localhost:3001
