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


class UserCreate(BaseModel):
    email: str
    password_hash: str
    role: str = "employee"
    is_active: bool = True


class UserResponse(UserCreate):
    id: int

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str
    description: str | None = None


class DepartmentResponse(DepartmentCreate):
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


class ApprovalCreate(BaseModel):
    exit_request_id: int
    approved_by: int | None = None
    status: str = "pending"
    comments: str | None = None


class ApprovalResponse(ApprovalCreate):
    id: int

    class Config:
        from_attributes = True


class ClearanceCreate(BaseModel):
    exit_request_id: int
    status: str = "pending"
    comments: str | None = None


class ClearanceResponse(ClearanceCreate):
    id: int

    class Config:
        from_attributes = True


class ExitInterviewCreate(BaseModel):
    exit_request_id: int
    feedback: str | None = None
    reason_for_leaving: str | None = None
    suggestions: str | None = None


class ExitInterviewResponse(ExitInterviewCreate):
    id: int

    class Config:
        from_attributes = True
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    user_id: int
    email: str
    role: str
    