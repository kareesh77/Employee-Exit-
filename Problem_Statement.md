# Problem Statement

## 1. Title

Employee Exit Management System

## 2. Domain

HRTech (Human Resources Technology)

## 3. Who is the user? (2-3 user types, with roles)

### 1. Employee
The employee can securely log in, submit an exit request, provide the resignation reason and proposed last working date, and track the status of the exit process.

### 2. HR / Admin
HR/Admin can securely log in, view employee exit requests, review and approve or reject requests, manage clearance status, add comments, and complete the employee exit process.

## 4. What problem are we solving? (3-5 sentences, real-life example)

Employee exit processes in organizations are often handled through emails, spreadsheets, and manual communication between employees and HR. This can make it difficult for employees to know the current status of their resignation and can cause delays in approvals and clearance activities. HR personnel may also find it difficult to maintain a centralized record of exit requests and their completion status. For example, when an employee submits a resignation through email, HR may need to manually track the approval, clearance, and final exit status using multiple systems or documents. The proposed system provides a centralized platform to manage and track the employee exit process.

## 5. Proposed Solution (what the application will do, feature-wise)

The Employee Exit Management System will be a full-stack web application that provides a centralized platform for managing employee exit requests.

### Employee Features

- Secure employee registration and login.
- Employee dashboard.
- Submit an exit/resignation request.
- Enter resignation reason.
- Provide proposed last working date.
- View submitted exit request details.
- Track exit request status.
- View HR comments and approval status.
- Submit exit interview/feedback.

### HR/Admin Features

- Secure HR/Admin login.
- HR dashboard.
- View all employee exit requests.
- View employee and exit request details.
- Approve or reject exit requests.
- Add comments during the approval process.
- Manage employee clearance status.
- View exit interview/feedback.
- Mark the exit process as completed.
- View basic exit process information and status.

### System Features

- Role-based access control.
- REST API based backend.
- Database-based storage of employee and exit information.
- Server-side input validation.
- Secure password hashing.
- Audit logging for important actions.
- Health/status endpoint.
- API documentation using Swagger/OpenAPI.
- Cloud deployment of the application and database.

## 6. Core Entities / Database Tables

The system will contain the following core database entities:

1. Users
2. Employees
3. Departments
4. Exit Requests
5. Approvals
6. Clearances
7. Exit Interviews
8. Audit Logs

### Main Relationships

- A Department can have many Employees.
- A User can be associated with an Employee account.
- An Employee can submit one or more Exit Requests over time.
- An Exit Request can have approval records.
- An Exit Request can have clearance records.
- An Exit Request can have an Exit Interview.
- Important system actions can be recorded in Audit Logs.

## 7. User Roles & Permissions

### Employee

Permissions:

- Register and log in.
- View personal dashboard.
- Submit an exit request.
- View own exit requests.
- Track own exit request status.
- View approval information related to own request.
- Submit exit interview/feedback.

An Employee cannot:

- View another employee's exit request.
- Approve or reject an exit request.
- Access HR/Admin functions.
- Modify HR-managed approval or clearance information.

### HR / Admin

Permissions:

- Log in securely.
- View employee exit requests.
- View employee exit details.
- Approve or reject exit requests.
- Add approval comments.
- Manage clearance status.
- View exit interview/feedback.
- Complete the exit process.
- View basic exit process information.

HR/Admin functions are protected using role-based authorization.

## 8. Success Criteria

The project will be considered successful when:

1. An employee can securely register/login and access the employee dashboard.
2. An employee can submit an exit request with a reason and proposed last working date.
3. The submitted exit request is stored correctly in the database.
4. An employee can view and track the status of their own exit request.
5. HR/Admin can securely log in and view pending exit requests.
6. HR/Admin can approve or reject an exit request and add comments.
7. The employee can see the updated approval status.
8. HR/Admin can manage the clearance and complete the exit process.
9. At least two complete end-to-end workflows work successfully from frontend to backend to database.
10. The application is deployed with a public frontend, backend API, and cloud-hosted database.
11. Basic automated tests pass successfully.
12. No passwords, API keys, or database credentials are committed to the GitHub repository.

## 9. Out of Scope

To keep the project achievable within the 60-day capstone timeline, the following features will not be included in the initial product:

- Payroll processing.
- Salary calculation.
- Full attendance management.
- Leave management.
- Recruitment management.
- Performance management.
- Employee salary settlement calculations.
- Integration with external HR/payroll enterprise systems.
- Mobile application.
- Real-time chat system.
- Multi-company enterprise support.
- Complex financial processing.
- Advanced analytics and business intelligence.
- Biometric integration.

Advanced features may be considered only as a future enhancement if the core system is completed successfully.

## 10. Chosen Track

### Python Track

- Frontend: React.js + Bootstrap + Axios
- Backend: FastAPI
- Authentication: Secure authentication with role-based access control
- ORM / Data Layer: SQLAlchemy
- Database: MySQL 8
- Testing: Pytest
- API Documentation: FastAPI Swagger/OpenAPI
- CI/CD: GitHub Actions
- Backend Hosting: Render or Railway
- Frontend Hosting: Vercel or Netlify
- Database Hosting: Railway, Clever Cloud, or Aiven
