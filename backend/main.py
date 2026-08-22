from fastapi import FastAPI, Depends
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
    ExitInterviewResponse
)

from models import (
    Employee,
    ExitRequest,
    Approval,
    Clearance,
    ExitInterview
)


app = FastAPI(
    title="Employee Exit API",
    description="Backend API for Employee Exit Management System",
    version="1.0.0"
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
def database_test(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar()

    return {
        "database": "connected",
        "test": result
    }


@app.post("/employees", response_model=EmployeeResponse)
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
        joining_date=employee.joining_date
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


@app.get("/employees", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


@app.post("/exit-requests", response_model=ExitRequestResponse)
def create_exit_request(
    exit_request: ExitRequestCreate,
    db: Session = Depends(get_db)
):
    new_exit_request = ExitRequest(
        employee_id=exit_request.employee_id,
        reason=exit_request.reason,
        proposed_last_working_date=exit_request.proposed_last_working_date
    )

    db.add(new_exit_request)
    db.commit()
    db.refresh(new_exit_request)

    return new_exit_request


@app.post("/approvals", response_model=ApprovalResponse)
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db)
):
    new_approval = Approval(
        exit_request_id=approval.exit_request_id,
        approved_by=approval.approved_by,
        status=approval.status,
        comments=approval.comments
    )

    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)

    return new_approval


@app.post("/clearances", response_model=ClearanceResponse)
def create_clearance(
    clearance: ClearanceCreate,
    db: Session = Depends(get_db)
):
    new_clearance = Clearance(
        exit_request_id=clearance.exit_request_id,
        status=clearance.status,
        comments=clearance.comments
    )

    db.add(new_clearance)
    db.commit()
    db.refresh(new_clearance)

    return new_clearance


@app.post("/exit-interviews", response_model=ExitInterviewResponse)
def create_exit_interview(
    interview: ExitInterviewCreate,
    db: Session = Depends(get_db)
):
    new_interview = ExitInterview(
        exit_request_id=interview.exit_request_id,
        feedback=interview.feedback,
        reason_for_leaving=interview.reason_for_leaving,
        suggestions=interview.suggestions
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return new_interview