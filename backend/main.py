from passlib.context import CryptContext

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
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
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
    db: Session = Depends(get_db)
):

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

        existing_approval.approved_by = 1

        existing_approval.comments = (
            f"Exit request {status} by HR"
        )

    else:

        new_approval = Approval(
            exit_request_id=exit_request_id,
            approved_by=1,
            status=status,
            comments=(
                f"Exit request {status} by HR"
            )
        )

        db.add(new_approval)

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
    db: Session = Depends(get_db)
):
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
    if status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or rejected"
        )
    clearance.status = status
    clearance.comments = f"Clearance {status} by HR"

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
        feedback=interview.feedback,
        reason_for_leaving=(
            interview.reason_for_leaving
        ),
        suggestions=interview.suggestions,
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

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

    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }