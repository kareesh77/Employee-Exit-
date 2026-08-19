from sqlalchemy import Column, Integer, BigInteger, String, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="employee")
    is_active = Column(Boolean, nullable=False, default=True)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), nullable=False)
    joining_date = Column(Date, nullable=False)


class ExitRequest(Base):
    __tablename__ = "exit_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    reason = Column(Text, nullable=False)
    proposed_last_working_date = Column(Date, nullable=False)
    status = Column(String(32), nullable=False, default="pending")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    exit_request_id = Column(Integer, ForeignKey("exit_requests.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(32), nullable=False, default="pending")
    comments = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)


class Clearance(Base):
    __tablename__ = "clearances"

    id = Column(Integer, primary_key=True, index=True)
    exit_request_id = Column(Integer, ForeignKey("exit_requests.id"), nullable=False)
    status = Column(String(32), nullable=False, default="pending")
    comments = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)


class ExitInterview(Base):
    __tablename__ = "exit_interviews"

    id = Column(Integer, primary_key=True, index=True)
    exit_request_id = Column(Integer, ForeignKey("exit_requests.id"), nullable=False)
    feedback = Column(Text, nullable=True)
    reason_for_leaving = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(BigInteger, nullable=True)