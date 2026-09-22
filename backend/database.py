import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker


MYSQL_HOST = os.getenv("MYSQLHOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQLPORT", "3306"))
MYSQL_USER = os.getenv("MYSQLUSER", "root")
MYSQL_PASSWORD = os.getenv("MYSQLPASSWORD", "EE@2026")
MYSQL_DATABASE = os.getenv(
    "MYSQLDATABASE",
    "employee_exit_management",
)


DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=MYSQL_USER,
    password=MYSQL_PASSWORD,
    host=MYSQL_HOST,
    port=MYSQL_PORT,
    database=MYSQL_DATABASE,
)

print("DATABASE CONFIG:")
print("MYSQL_HOST =", MYSQL_HOST)
print("MYSQL_PORT =", MYSQL_PORT)
print("MYSQL_USER =", MYSQL_USER)
print("MYSQL_DATABASE =", MYSQL_DATABASE)
print("PASSWORD_LENGTH =", len(MYSQL_PASSWORD))
print("PASSWORD_CONFIGURED =", bool(MYSQL_PASSWORD))

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