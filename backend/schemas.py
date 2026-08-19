from datetime import date
from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    user_id: int
    employee_code: str
    first_name: str
    last_name: str
    phone: str | None = None
    department_id: int
    designation: str
    joining_date: date


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        from_attributes = True
        class ExitRequestCreate(BaseModel):
    employee_id: int
    reason: str
    proposed_last_working_date: date


class ExitRequestResponse(ExitRequestCreate):
    id: int
    status: str

    class Config:
        from_attributes = True