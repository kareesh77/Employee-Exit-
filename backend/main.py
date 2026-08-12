from fastapi import FastAPI

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