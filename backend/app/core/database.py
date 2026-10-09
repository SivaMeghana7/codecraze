from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# SQLite compatibility settings for thread-safety
connect_args = {"check_same_thread": False} if settings.normalized_database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.normalized_database_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session and safely closes it upon completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables using SQLAlchemy metadata."""
    import app.models  # noqa: F401 - ensure models are registered on Base.metadata
    Base.metadata.create_all(bind=engine)
