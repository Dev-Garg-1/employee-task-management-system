# Employee & Task Management System

A basic ASP.NET Core 10 Web API application for managing employees and task assignments, backed by PostgreSQL on Neon. Developed as a clean, straightforward project for a college presentation.

## Documentation Reference
For full project architecture, data models, API routes, current status, and roadmap, please see [PROJECT_OVERVIEW.md](file:///home/dev-garg/Desktop/github/employee-task-management-system/PROJECT_OVERVIEW.md).

## Core Features
- **Employee Management:** CRUD operations for employee records (Name, Department, Designation, Status).
- **Task Management:** Assign and track tasks with status, priority, due dates, and assigned employees.
- **PostgreSQL Database:** Connected to Neon cloud database via EF Core 10.
- **OpenAPI / Swagger:** Interactive API documentation built-in.

## How to Run
```bash
dotnet restore
dotnet run
```
Access Swagger UI at `https://localhost:<port>/swagger` in development environment.
