# MediFind AI — Python FastAPI Backend

This is the primary Python FastAPI backend for **MediFind AI** (CSE Minor Project).

## Tech Stack
- **Framework:** FastAPI (Python 3.10+)
- **Database:** MySQL + SQLAlchemy ORM (with SQLite dev fallback)
- **AI Model:** Google Gemini API (`@google/genai` / `google-genai`)
- **OCR Engine:** Tesseract OCR / `pytesseract` + `Pillow`
- **Authentication:** JWT tokens + Password hashing

## Directory Structure
```
backend/
├── app/
│   ├── config.py              # Environment and settings configuration
│   ├── database/
│   │   └── connection.py      # SQLAlchemy engine & session dependency
│   ├── models/                # MySQL / SQLAlchemy entity models
│   ├── schemas/               # Pydantic request/response validation schemas
│   ├── routes/                # REST API routers
│   ├── services/
│   │   ├── ocr_service.py     # Tesseract prescription text extraction
│   │   └── gemini_service.py  # Gemini AI medical safety engine
│   └── main.py                # FastAPI application entry point
├── seed_data.py               # Database initial population script
├── requirements.txt           # Python dependencies
└── README.md
```

## How to Run FastAPI Backend

### 1. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_SERVER=localhost
MYSQL_PORT=3306
MYSQL_DB=medifind_db
```

### 3. Seed Database
```bash
python -m backend.seed_data
```

### 4. Start the FastAPI Server
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger API Documentation will be available at:
`http://localhost:8000/docs`
