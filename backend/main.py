from fastapi import HTTPException
from schemas import EmployeeCreate, EmployeeResponse
from models import Employee
from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db


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