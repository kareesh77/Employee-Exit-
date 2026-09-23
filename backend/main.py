import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Approval,
    AuditLog,
    Clearance,
    Employee,
    ExitInterview,
    ExitRequest,
    User,
)
from schemas import (
    ApprovalCreate,
    ApprovalResponse,
    ClearanceCreate,
    ClearanceResponse,
    EmployeeCreate,
    EmployeeResponse,
    ExitInterviewCreate,
    ExitInterviewResponse,
    ExitRequestCreate,
    ExitRequestResponse,
    HREmployeeCreate,
    LoginRequest,
    LoginResponse,
)

load_dotenv()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)

security = HTTPBearer()


def create_access_token(user_id: int, role: str):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


app = FastAPI(
    title="Employee Exit API",
    description="Backend API for Employee Exit Management System",
    version="1.0.0",
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://employee-exit-frontend.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_audit_log(
    db: Session,
    user_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
):
    audit = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
    )

    db.add(audit)


@app.get("/")
def root():
    return {
        "message": "Employee Exit API is running successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def database_test(
    db: Session = Depends(get_db),
):
    try:
        result = db.execute(
            text("SELECT 1")
        ).scalar()

        return {
            "database": "connected",
            "test": result,
        }

    except Exception as e:
        return {
            "database": "connection failed",
            "mysql_host": os.getenv("MYSQLHOST"),
            "mysql_port": os.getenv("MYSQLPORT"),
            "mysql_user": os.getenv("MYSQLUSER"),
            "mysql_database": os.getenv("MYSQLDATABASE"),
            "password_configured": bool(
                os.getenv("MYSQLPASSWORD")
            ),
            "error": str(e),
        }

@app.post("/hr/employees")
def create_employee_by_hr(
    employee: HREmployeeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR administrators can create employees",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == employee.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    existing_employee = (
        db.query(Employee)
        .filter(
            Employee.employee_code
            == employee.employee_code
        )
        .first()
    )

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee code already exists",
        )

    try:
        password_hash = pwd_context.hash(
            employee.password
        )

        new_user = User(
            email=employee.email,
            password_hash=password_hash,
            role="employee",
            is_active=True,
        )

        db.add(new_user)
        db.flush()

        new_employee = Employee(
            user_id=new_user.id,
            employee_code=employee.employee_code,
            first_name=employee.first_name,
            last_name=employee.last_name,
            phone=employee.phone,
            department_id=employee.department_id,
            designation=employee.designation,
            joining_date=employee.joining_date,
        )

        db.add(new_employee)
        db.flush()

        create_audit_log(
            db=db,
            user_id=current_user.id,
            action="Employee account created by HR",
            entity_type="Employee",
            entity_id=new_employee.id,
        )

        db.commit()

        db.refresh(new_user)
        db.refresh(new_employee)

        return {
            "message": "Employee account created successfully",
            "user_id": new_user.id,
            "employee_id": new_employee.id,
            "email": new_user.email,
            "employee_code": new_employee.employee_code,
            "role": new_user.role,
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create employee account",
        )

@app.post(
    "/employees",
    response_model=EmployeeResponse,
)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
):
    new_employee = Employee(
        user_id=employee.user_id,
        employee_code=employee.employee_code,
        first_name=employee.first_name,
        last_name=employee.last_name,
        phone=employee.phone,
        department_id=employee.department_id,
        designation=employee.designation,
        joining_date=employee.joining_date,
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    create_audit_log(
        db=db,
        user_id=employee.user_id,
        action="Employee created",
        entity_type="Employee",
        entity_id=new_employee.id,
    )

    db.commit()

    return new_employee


@app.get(
    "/employees",
    response_model=list[EmployeeResponse],
)
def get_employees(
    db: Session = Depends(get_db),
):
    return db.query(Employee).all()


@app.post(
    "/exit-requests",
    response_model=ExitRequestResponse,
)
def create_exit_request(
    exit_request: ExitRequestCreate,
    db: Session = Depends(get_db),
):
    new_exit_request = ExitRequest(
        employee_id=exit_request.employee_id,
        reason=exit_request.reason,
        proposed_last_working_date=(
            exit_request.proposed_last_working_date
        ),
    )

    db.add(new_exit_request)
    db.commit()
    db.refresh(new_exit_request)

    create_audit_log(
        db=db,
        user_id=None,
        action="Exit request created",
        entity_type="ExitRequest",
        entity_id=new_exit_request.id,
    )

    db.commit()

    return new_exit_request


@app.get(
    "/exit-requests",
    response_model=list[ExitRequestResponse],
)
def get_exit_requests(
    db: Session = Depends(get_db),
):
    return db.query(ExitRequest).all()


@app.put(
    "/exit-requests/{exit_request_id}/status"
)
def update_exit_request_status(
    exit_request_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR administrators can update exit requests",
        )

    exit_request = (
        db.query(ExitRequest)
        .filter(ExitRequest.id == exit_request_id)
        .first()
    )

    if not exit_request:
        raise HTTPException(
            status_code=404,
            detail="Exit request not found",
        )

    if status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected",
        )

    exit_request.status = status

    approval = (
        db.query(Approval)
        .filter(
            Approval.exit_request_id == exit_request.id
        )
        .first()
    )

    if approval:
        approval.status = status
        approval.approved_by = current_user.id
        approval.comments = f"Exit request {status} by HR"
    else:
        approval = Approval(
            exit_request_id=exit_request.id,
            approved_by=current_user.id,
            status=status,
            comments=f"Exit request {status} by HR",
        )

        db.add(approval)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=f"Exit request {status} by HR",
        entity_type="ExitRequest",
        entity_id=exit_request.id,
    )

    db.commit()
    db.refresh(exit_request)

    return {
        "message": f"Exit request {status} successfully",
        "id": exit_request.id,
        "status": exit_request.status,
    }


@app.post(
    "/approvals",
    response_model=ApprovalResponse,
)
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db),
):
    new_approval = Approval(
        exit_request_id=approval.exit_request_id,
        approved_by=approval.approved_by,
        status=approval.status,
        comments=approval.comments,
    )

    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)

    create_audit_log(
        db=db,
        user_id=approval.approved_by,
        action=f"Approval {approval.status}",
        entity_type="Approval",
        entity_id=new_approval.id,
    )

    db.commit()

    return new_approval


@app.get(
    "/approvals",
    response_model=list[ApprovalResponse],
)
def get_approvals(
    db: Session = Depends(get_db),
):
    return db.query(Approval).all()


@app.post(
    "/clearances",
    response_model=ClearanceResponse,
)
def create_clearance(
    clearance: ClearanceCreate,
    db: Session = Depends(get_db),
):
    new_clearance = Clearance(
        exit_request_id=clearance.exit_request_id,
        status=clearance.status,
        comments=clearance.comments,
    )

    db.add(new_clearance)
    db.commit()
    db.refresh(new_clearance)

    create_audit_log(
        db=db,
        user_id=None,
        action="Clearance created",
        entity_type="Clearance",
        entity_id=new_clearance.id,
    )

    db.commit()

    return new_clearance


@app.get(
    "/clearances",
    response_model=list[ClearanceResponse],
)
def get_clearances(
    db: Session = Depends(get_db),
):
    return db.query(Clearance).all()


@app.put(
    "/clearances/{clearance_id}/status"
)
def update_clearance_status(
    clearance_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR administrators can approve clearances",
        )

    clearance = (
        db.query(Clearance)
        .filter(Clearance.id == clearance_id)
        .first()
    )

    if not clearance:
        raise HTTPException(
            status_code=404,
            detail="Clearance not found",
        )

    if status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected",
        )

    clearance.status = status
    clearance.comments = f"Clearance {status} by HR"

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=f"Clearance {status} by HR",
        entity_type="Clearance",
        entity_id=clearance.id,
    )

    db.commit()
    db.refresh(clearance)

    return {
        "message": f"Clearance {status} successfully",
        "id": clearance.id,
        "status": clearance.status,
    }


@app.get(
    "/exit-interviews",
    response_model=list[ExitInterviewResponse],
)
def get_my_exit_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interviews = (
        db.query(ExitInterview)
        .filter(
            ExitInterview.user_id == current_user.id
        )
        .order_by(
            ExitInterview.id.desc()
        )
        .all()
    )

    return interviews


@app.post(
    "/exit-interviews",
    response_model=ExitInterviewResponse,
)
def create_exit_interview(
    interview: ExitInterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_interview = ExitInterview(
        exit_request_id=interview.exit_request_id,
        user_id=current_user.id,
        feedback=interview.feedback,
        reason_for_leaving=interview.reason_for_leaving,
        suggestions=interview.suggestions,
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="Exit interview created",
        entity_type="ExitInterview",
        entity_id=new_interview.id,
    )

    db.commit()

    return new_interview


@app.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == login_data.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    try:
        password_valid = pwd_context.verify(
            login_data.password,
            user.password_hash,
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to verify password. "
                "Check the stored password hash."
            ),
        )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }


@app.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
):
    logs = (
        db.query(AuditLog)
        .order_by(
            AuditLog.id.desc()
        )
        .all()
    )

    return logs