from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

MYSQL_PASSWORD = "EE@2026"

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username="root",
    password=MYSQL_PASSWORD,
    host="localhost",
    port=3306,
    database="employee_exit_management",
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()