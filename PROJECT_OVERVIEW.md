# Employee & Task Management System — Project Reference & Documentation

> **Note:** This document serves as the reference guide for AI assistants and developers working on this project. It outlines the current state, architecture, models, database, and planned features for a simple college-level Employee and Task Management application.

---

## 1. Project Overview & Context
- **Target Audience / Purpose:** College Project Demonstration.
- **Core Concept:** A clean, straightforward RESTful API application to manage Employees and assign/track Tasks.
- **Design Philosophy:** Simple, easy to explain, modular, and not overly complex.

---

## 2. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | .NET 10.0 (`net10.0`) | ASP.NET Core Web API |
| **ORM / Data Access** | Entity Framework Core 10.0.11 | `Npgsql.EntityFrameworkCore.PostgreSQL` |
| **Database** | PostgreSQL | Cloud-hosted on **Neon Tech** (`neondb`) |
| **API Documentation**| Swagger / OpenAPI | `Swashbuckle.AspNetCore` & `Microsoft.AspNetCore.OpenApi` |
| **Architecture** | Controllers Pattern | `[ApiController]`, RESTful routes |

---

## 3. Database Architecture & Data Models

The database consists of three primary entities defined in `EmployeeTaskManagement.Models`:

### A. `User` Entity (`Models/User.cs`)
Used for system authentication and user roles.
- `Id` (`int`, Primary Key, Auto-increment)
- `Name` (`string`)
- `Email` (`string`)
- `PasswordHash` (`string`)
- `Role` (`string`, Default: `"Employee"`)

### B. `Employee` Entity (`Models/Employee.cs`)
Represents workforce members.
- `Id` (`int`, Primary Key, Auto-increment)
- `Name` (`string`)
- `Email` (`string`)
- `Department` (`string`)
- `Designation` (`string`)
- `IsActive` (`bool`, Default: `true`)
- `Tasks` (`ICollection<TaskItem>`, Navigation property to assigned tasks)

### C. `TaskItem` Entity (`Models/Task.cs`)
Represents tasks assigned to employees.
- `Id` (`int`, Primary Key, Auto-increment)
- `Title` (`string`)
- `Description` (`string`)
- `Priority` (`string`, Default: `"Medium"`) — e.g., Low, Medium, High
- `Status` (`string`, Default: `"Pending"`) — e.g., Pending, In Progress, Completed
- `DueDate` (`DateTime`)
- `AssignedEmployeeId` (`int`, Foreign Key referencing `Employee.Id`)
- `AssignedEmployee` (`Employee?`, Navigation property)

---

## 4. Database Context & Migrations

- **DbContext Class:** `Data/AppDbContext.cs`
  - `DbSet<User> Users`
  - `DbSet<Employee> Employees`
  - `DbSet<TaskItem> Tasks`
- **Connection String:** Configured in `appsettings.json` under `"DefaultConnection"` (pointing to Neon PostgreSQL cloud cluster).
- **EF Core Migration:** `Migrations/20260821131007_InitialCreate.cs` (Executed & committed).

---

## 5. Current Implementation Status

### Completed Components
1. **Database Connection & Models Configuration:** `AppDbContext`, `User`, `Employee`, `TaskItem`.
2. **EF Migrations:** Initial schema generated and synced with Neon PostgreSQL.
3. **`EmployeesController` (`Controllers/EmployeesController.cs`):**
   - `GET /api/employees` — Fetch all employees.
   - `GET /api/employees/{id}` — Fetch employee by ID.
   - `POST /api/employees` — Add new employee.
   - `PUT /api/employees/{id}` — Update existing employee details.
   - `DELETE /api/employees/{id}` — Remove employee.
4. **`TasksController` (`Controllers/TasksController.cs`):**
   - `GET /api/tasks` — Fetch all tasks with employee details (optional `?employeeId=` and `?status=` filters).
   - `GET /api/tasks/{id}` — Fetch task by ID with assigned employee info.
   - `GET /api/tasks/employee/{employeeId}` — Fetch all tasks for a specific employee.
   - `POST /api/tasks` — Create task with employee existence validation.
   - `PUT /api/tasks/{id}` — Update task details and reassign employee (with employee existence validation).
   - `PATCH /api/tasks/{id}/status` — Update task status.
   - `DELETE /api/tasks/{id}` — Remove task.
5. **DTOs Layer (`DTOs/`):**
   - `CreateTaskDto.cs`
   - `UpdateTaskDto.cs`
   - `UpdateTaskStatusDto.cs`
6. **JSON Cycle Handling:** Configured `ReferenceHandler.IgnoreCycles` in `Program.cs`.

### Remaining Components
- **`Controllers/AuthController.cs`** (Authentication endpoints: Login, Register).
- **`Services/AuthService.cs`** (Password hashing / JWT token logic if needed).
- **`DTOs/LoginDto.cs`** & `CreateEmployeeDto.cs`.

---

## 6. Directory Map

```
employee-task-management-system/
├── Controllers/
│   ├── AuthController.cs          # (Skeleton) Authentication endpoints
│   ├── EmployeesController.cs     # (Implemented) Employee CRUD endpoints
│   └── TasksController.cs         # (Implemented) Task CRUD & Employee mapping endpoints
├── Data/
│   └── AppDbContext.cs            # EF Core DbContext for PostgreSQL
├── DTOs/
│   ├── CreateEmployeeDto.cs       # Data transfer object for adding employees
│   ├── CreateTaskDto.cs           # (Implemented) Payload for creating tasks
│   ├── UpdateTaskDto.cs           # (Implemented) Payload for updating tasks
│   ├── UpdateTaskStatusDto.cs     # (Implemented) Payload for task status updates
│   └── LoginDto.cs                # Data transfer object for user login
├── Migrations/                    # EF Core migration files
├── Models/
│   ├── Employee.cs                # Employee domain model
│   ├── Task.cs                    # TaskItem domain model
│   └── User.cs                    # User domain model
├── Services/
│   └── AuthService.cs             # (Skeleton) Authentication business logic
├── appsettings.json               # Config & PostgreSQL Connection String
├── Program.cs                     # Web API entry point, JSON options & service registration
└── PROJECT_OVERVIEW.md            # Complete reference documentation
```

---

## 7. Roadmap & Next Steps for College Presentation

1. **Simple Authentication (Optional for college demo):**
   - Basic login/registration in `AuthController`.
2. **Frontend Interface (If required for demo):**
   - HTML/JS dashboard or React/Vite web application connecting to Swagger/API endpoints.
