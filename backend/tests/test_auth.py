import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import main


def test_create_access_token():
    token = main.create_access_token(
        user_id=1,
        role="hr"
    )

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 20


def test_get_current_user_with_invalid_token():
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="abc.def.ghi"
    )

    with pytest.raises(HTTPException) as exc:
        main.get_current_user(
            credentials=credentials,
            db=None
        )

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid or expired token"


def test_get_current_user_without_user_id():
    token = main.jwt.encode(
        {"role": "employee"},
        main.SECRET_KEY,
        algorithm=main.ALGORITHM
    )

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )

    with pytest.raises(HTTPException) as exc:
        main.get_current_user(
            credentials=credentials,
            db=None
        )

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid or expired token"


def test_password_hash_and_verify():
    password = "TestPassword123!"

    hashed = main.pwd_context.hash(password)

    assert main.pwd_context.verify(
        password,
        hashed
    )

    assert not main.pwd_context.verify(
        "WrongPassword",
        hashed
    )