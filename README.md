# Employee Task Management System

A clean, modern, and production-ready **Employee Task Management System** built with **ASP.NET Core Web API (.NET 10)** and **React + TypeScript + Vite + Tailwind CSS**, backed by **Neon PostgreSQL**.

---

## 🌟 Project Overview

The Employee Task Management System provides a role-based platform for managing organization employees, creating and assigning tasks with priorities and deadlines, tracking status workflows (`Pending` ➔ `In Progress` ➔ `Completed`), and visualizing operational metrics on real-time dashboards.

---

## ✨ Features

### 👑 Admin Features
- **Comprehensive Analytics Dashboard**: Live metrics for Total Employees, Active Employees, Total Tasks, Pending, In Progress, and Completed statuses, plus recent activity logs.
- **Employee Directory Management**: View, search, add, edit, and deactivate/reactivate staff members across departments.
- **Task Delegation & Assignment**: Create and assign tasks with 3 priority levels (`Low`, `Medium`, `High`), due dates, and rich descriptions.
- **Task Lifecycle Control**: Edit task details, reassign members, or delete tasks.
- **Automatic User Provisioning**: Creating an employee automatically generates an associated login account.

### 👤 Employee Features
- **Personalized Dashboard**: View personal workload statistics (Total Assigned, Pending, In Progress, Completed).
- **Assigned Tasks View**: Clean interface focused only on tasks assigned to the logged-in employee.
- **Direct Status Progression**: Instant one-click status transitions (`Pending` ➔ `In Progress` ➔ `Completed`).
- **Detailed Task View**: Inspect full task requirements, due dates, and assigner details in an accessible modal.

### 🔒 Security & Architecture
- **JWT Authentication**: Secure JSON Web Token authentication with Bearer authorization header.
- **Role-Based Access Control (RBAC)**: Enforced both on the backend (`[Authorize(Roles = "Admin")]`) and on the frontend route guards.
- **Secure Password Storage**: Industry-standard **BCrypt** password hashing.
- **Automated Seeding & Migrations**: Auto-migrates database schema and populates sample demo accounts and tasks on startup.
- **Swagger / OpenAPI Documentation**: Interactive API documentation configured with Bearer JWT testing support.

---

## 🛠️ Tech Stack

### Backend
- **C# / ASP.NET Core Web API** (.NET 10)
- **Entity Framework Core** with **Npgsql PostgreSQL Provider**
- **Neon.tech PostgreSQL** Serverless Database
- **JWT Bearer Authentication** (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **BCrypt.Net-Next** (Password Hashing)
- **Swashbuckle Swagger / OpenAPI**

### Frontend
- **React 18** with **TypeScript**
- **Vite** (Next-generation frontend tooling)
- **Tailwind CSS** (Modern utility-first styling)
- **React Router v6** (Client-side routing & guards)
- **Axios** (Centralized API client with JWT interceptors)
- **Lucide React** (Modern iconography)

---

## 📁 Project Structure

```text
employee-task-management-system/
│
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs         # Login & Profile endpoints
│   │   ├── EmployeesController.cs    # Employee management CRUD
│   │   ├── TasksController.cs        # Task CRUD & Status workflow
│   │   └── DashboardController.cs    # Role-based dashboard analytics
│   ├── Data/
│   │   ├── AppDbContext.cs           # EF Core Database Context & Relations
│   │   └── DbInitializer.cs          # Schema & Sample data seeding
│   ├── DTOs/
│   │   ├── LoginDto.cs
│   │   ├── AuthResponseDto.cs
│   │   ├── CreateEmployeeDto.cs
│   │   ├── UpdateEmployeeDto.cs
│   │   ├── EmployeeResponseDto.cs
│   │   ├── CreateTaskDto.cs
│   │   ├── UpdateTaskDto.cs
│   │   ├── UpdateTaskStatusDto.cs
│   │   ├── TaskResponseDto.cs
│   │   └── DashboardStatsDto.cs
│   ├── Models/
│   │   ├── User.cs                   # User account entity
│   │   ├── Employee.cs               # Employee staff entity
│   │   └── TaskItem.cs               # Task entity with foreign keys
│   ├── Services/
│   │   └── AuthService.cs            # BCrypt hashing & JWT token generator
│   ├── appsettings.json              # Connection strings & JWT config
│   ├── .env.example
│   ├── Program.cs                    # Application startup & DI configuration
│   └── EmployeeTaskManagement.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx            # App Shell with Sidebar & Topbar
│   │   │   ├── Modal.tsx             # Accessible Reusable Modal
│   │   │   ├── PriorityBadge.tsx     # Low / Medium / High badges
│   │   │   ├── ProtectedRoute.tsx    # Role & Auth route guard
│   │   │   ├── StatCard.tsx          # Metric KPI Cards
│   │   │   └── StatusBadge.tsx       # Pending / In Progress / Completed badges
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Persistent Auth State & Login/Logout
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx     # Admin & Employee Dashboard
│   │   │   ├── EmployeesPage.tsx     # Admin Employee Directory & Form
│   │   │   ├── LoginPage.tsx         # Login Form with Quick-Fill buttons
│   │   │   ├── MyTasksPage.tsx       # Employee Task Tracker
│   │   │   ├── NotFoundPage.tsx      # 404 Route
│   │   │   └── TasksPage.tsx         # Admin Task Management & Form
│   │   ├── services/
│   │   │   └── api.ts                # Centralized Axios Client & Interceptors
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript Models & Interfaces
│   │   ├── App.tsx                   # App Routing Configuration
│   │   ├── index.css                 # Tailwind CSS & custom styles
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v18+) & npm](https://nodejs.org/)
- PostgreSQL database instance (e.g. [Neon.tech](https://neon.tech))

---

### 1. Clone the Repository
```bash
git clone https://github.com/Dev-Garg-1/employee-task-management-system.git
cd employee-task-management-system
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify or configure `appsettings.json` (or set the `DATABASE_URL` environment variable) with your PostgreSQL connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=<HOST>;Database=neondb;Username=<USER>;Password=<PASSWORD>;SSL Mode=VerifyFull;Channel Binding=Require;"
     },
     "Jwt": {
       "Secret": "SuperSecretEmployeeTaskManagementSecretKey2026!#$*LongEnoughForHmacSha256SecurityRequirement",
       "Issuer": "EmployeeTaskManagement",
       "Audience": "EmployeeTaskManagementClient"
     }
   }
   ```
3. Restore dependencies and run the backend:
   ```bash
   dotnet restore
   dotnet run --urls=http://localhost:5000
   ```
   > 💡 *Note: On startup, `DbInitializer` automatically connects to the PostgreSQL database, applies schema creation, and seeds demo Admin and Employee accounts along with sample tasks.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify or configure `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔑 Demo Credentials

For quick testing and grading, predefined demo accounts are provided:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@example.com` | `Admin@123` |
| **Employee** | John Doe (Engineering) | `john.doe@example.com` | `Employee@123` |
| **Employee** | Sarah Smith (UI/UX Design) | `sarah.smith@example.com` | `Employee@123` |
| **Employee** | Mike Johnson (Marketing) | `mike.johnson@example.com` | `Employee@123` |
| **Employee** | Emily Davis (QA Testing) | `emily.davis@example.com` | `Employee@123` |

> 💡 *Tip: The Login page includes **Quick Demo Fill** buttons to automatically fill credentials with a single click.*

---

## 📖 API Documentation (Swagger)

When the backend is running, the interactive Swagger UI is available at:

👉 **[http://localhost:5000/swagger](http://localhost:5000/swagger)**

### Key Endpoints:

#### 🔐 Authentication
- `POST /api/auth/login` — Authenticate user and receive JWT token.
- `GET /api/auth/me` — Retrieve profile of currently authenticated user.

#### 👥 Employees (`Admin` only for modification)
- `GET /api/employees` — List all employees with task counts and search/filter support.
- `GET /api/employees/{id}` — Get employee details by ID.
- `POST /api/employees` — Create a new employee and provision user account.
- `PUT /api/employees/{id}` — Update employee details.
- `DELETE /api/employees/{id}` — Deactivate employee (soft delete).

#### 📋 Tasks
- `GET /api/tasks` — List tasks (Admins see all; Employees see only their assigned tasks).
- `GET /api/tasks/{id}` — Get task details by ID.
- `POST /api/tasks` — (`Admin` only) Create task and assign to employee.
- `PUT /api/tasks/{id}` — (`Admin` only) Update task information and reassignment.
- `PATCH /api/tasks/{id}/status` — Update task status (`Pending` ➔ `In Progress` ➔ `Completed`).
- `DELETE /api/tasks/{id}` — (`Admin` only) Delete task.

#### 📊 Dashboard
- `GET /api/dashboard` — Returns analytics metrics tailored to the user's role.

---

## 📸 Screenshots

*(Add system screenshots below)*

| Admin Dashboard | Employee Tasks View |
| :---: | :---: |
| *Admin overview with KPI metrics & recent activity* | *Task tracking card view with quick status updates* |

---

## 📄 License
This project is licensed under the MIT License.
