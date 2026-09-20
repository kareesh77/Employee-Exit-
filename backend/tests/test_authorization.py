import pytest
from fastapi import HTTPException

import main


class FakeQuery:
    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return None


class FakeDB:
    def query(self, model):
        return FakeQuery()


def test_employee_cannot_update_exit_request():
    employee = main.User(
        id=2,
        email="employee@example.com",
        role="employee"
    )

    with pytest.raises(HTTPException) as exc:
        main.update_exit_request_status(
            exit_request_id=7,
            status="approved",
            current_user=employee,
            db=FakeDB()
        )

    assert exc.value.status_code == 403
    assert exc.value.detail == (
        "Only HR administrators can update exit requests"
    )


def test_employee_cannot_update_clearance():
    employee = main.User(
        id=2,
        email="employee@example.com",
        role="employee"
    )

    with pytest.raises(HTTPException) as exc:
        main.update_clearance_status(
            clearance_id=11,
            status="approved",
            current_user=employee,
            db=FakeDB()
        )

    assert exc.value.status_code == 403
    assert exc.value.detail == (
        "Only HR administrators can approve clearances"
    )


def test_hr_gets_404_for_missing_exit_request():
    hr_user = main.User(
        id=1,
        email="admin@example.com",
        role="hr"
    )

    with pytest.raises(HTTPException) as exc:
        main.update_exit_request_status(
            exit_request_id=99999,
            status="approved",
            current_user=hr_user,
            db=FakeDB()
        )

    assert exc.value.status_code == 404
    assert exc.value.detail == "Exit request not found"


def test_hr_gets_404_for_missing_clearance():
    hr_user = main.User(
        id=1,
        email="admin@example.com",
        role="hr"
    )

    with pytest.raises(HTTPException) as exc:
        main.update_clearance_status(
            clearance_id=99999,
            status="approved",
            current_user=hr_user,
            db=FakeDB()
        )

    assert exc.value.status_code == 404
    assert exc.value.detail == "Clearance not found"
