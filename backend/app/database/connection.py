from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from ..config import settings

logger = logging.getLogger(__name__)

# Fallback to SQLite if MySQL is not currently running locally during development
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
except Exception as e:
    logger.warning(f"Could not connect to MySQL at {settings.DATABASE_URL}, using sqlite fallback: {e}")
    engine = create_engine("sqlite:///./medifind.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
