from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

from schemas import (
    EmployeeCreate,
    EmployeeResponse,
    ExitRequestCreate,
    ExitRequestResponse,
    ApprovalCreate,
    ApprovalResponse,
    ClearanceCreate,
    ClearanceResponse,
    ExitInterviewCreate,
    ExitInterviewResponse,
    LoginRequest,
    LoginResponse,
)

from models import (
    User,
    Employee,
    ExitRequest,
    Approval,
    Clearance,
    ExitInterview,
    AuditLog,
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

SECRET_KEY = "employee-exit-management-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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
        algorithm=ALGORITHM
    )

app = FastAPI(
    title="Employee Exit API",
    description="Backend API for Employee Exit Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("SELECT 1")
    ).scalar()

    return {
        "database": "connected",
        "test": result
    }


@app.post(
    "/employees",
    response_model=EmployeeResponse
)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
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
    response_model=list[EmployeeResponse]
)
def get_employees(
    db: Session = Depends(get_db)
):
    return db.query(Employee).all()


@app.post(
    "/exit-requests",
    response_model=ExitRequestResponse
)
def create_exit_request(
    exit_request: ExitRequestCreate,
    db: Session = Depends(get_db)
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
    response_model=list[ExitRequestResponse]
)
def get_exit_requests(
    db: Session = Depends(get_db)
):
    return db.query(ExitRequest).all()


@app.post(
    "/approvals",
    response_model=ApprovalResponse
)
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db)
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
    response_model=list[ApprovalResponse]
)
def get_approvals(
    db: Session = Depends(get_db)
):
    return db.query(Approval).all()


@app.put(
    "/exit-requests/{exit_request_id}/status"
)
def update_exit_request_status(
    exit_request_id: int,
    status: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR administrators can approve exit requests"
        )

    exit_request = (
        db.query(ExitRequest)
        .filter(
            ExitRequest.id == exit_request_id
        )
        .first()
    )

    if not exit_request:
        raise HTTPException(
            status_code=404,
            detail="Exit request not found"
        )

    if status not in [
        "approved",
        "rejected"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected"
        )

    exit_request.status = status

    if status == "approved":
        existing_clearance = (
            db.query(Clearance)
            .filter(
                Clearance.exit_request_id
                == exit_request_id
            )
            .first()
        )

        if not existing_clearance:
            new_clearance = Clearance(
                exit_request_id=exit_request_id,
                status="pending",
                comments="Clearance pending HR review"
            )

            db.add(new_clearance)

    existing_approval = (
        db.query(Approval)
        .filter(
            Approval.exit_request_id
            == exit_request_id
        )
        .order_by(
            Approval.id.desc()
        )
        .first()
    )

    if existing_approval:
        existing_approval.status = status
        existing_approval.approved_by = user_id
        existing_approval.comments = (
            f"Exit request {status} by HR"
        )
    else:
        new_approval = Approval(
            exit_request_id=exit_request_id,
            approved_by=user_id,
            status=status,
            comments=(
                f"Exit request {status} by HR"
            )
        )

        db.add(new_approval)

    create_audit_log(
        db=db,
        user_id=user_id,
        action=f"Exit request {status} by HR",
        entity_type="ExitRequest",
        entity_id=exit_request.id,
    )

    db.commit()
    db.refresh(exit_request)

    return {
        "message": (
            f"Exit request {status} successfully"
        ),
        "id": exit_request.id,
        "status": exit_request.status
    }


@app.post(
    "/clearances",
    response_model=ClearanceResponse
)
def create_clearance(
    clearance: ClearanceCreate,
    db: Session = Depends(get_db)
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
    response_model=list[ClearanceResponse]
)
def get_clearances(
    db: Session = Depends(get_db)
):
    return db.query(Clearance).all()


@app.put("/clearances/{clearance_id}/status")
def update_clearance_status(
    clearance_id: int,
    status: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR administrators can approve clearances"
        )

    clearance = (
        db.query(Clearance)
        .filter(Clearance.id == clearance_id)
        .first()
    )

    if not clearance:
        raise HTTPException(
            status_code=404,
            detail="Clearance not found"
        )

    if status not in [
        "approved",
        "rejected"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected"
        )

    clearance.status = status
    clearance.comments = f"Clearance {status} by HR"

    create_audit_log(
        db=db,
        user_id=user_id,
        action=f"Clearance {status} by HR",
        entity_type="Clearance",
        entity_id=clearance.id,
    )

    db.commit()
    db.refresh(clearance)

    return {
        "message": f"Clearance {status} successfully",
        "id": clearance.id,
        "status": clearance.status
    }

@app.post(
    "/exit-interviews",
    response_model=ExitInterviewResponse
)
def create_exit_interview(
    interview: ExitInterviewCreate,
    db: Session = Depends(get_db)
):
    new_interview = ExitInterview(
        exit_request_id=interview.exit_request_id,
        user_id=interview.user_id,
        feedback=interview.feedback,
        reason_for_leaving=interview.reason_for_leaving,
        suggestions=interview.suggestions,
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    create_audit_log(
        db=db,
        user_id=interview.user_id,
        action="Exit interview created",
        entity_type="ExitInterview",
        entity_id=new_interview.id,
    )

    db.commit()

    return new_interview


@app.get(
    "/exit-interviews",
    response_model=list[ExitInterviewResponse]
)
def get_exit_interviews(
    db: Session = Depends(get_db)
):
    return db.query(ExitInterview).all()


@app.post(
    "/login",
    response_model=LoginResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
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
    role=user.role
)

    return {
    "message": "Login successful",
    "access_token": access_token,
    "user_id": user.id,
    "email": user.email,
    "role": user.role
}


@app.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db)
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return logs