using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using EmployeeTaskManagement.Models;
using EmployeeTaskManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public EmployeesController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    /// <summary>
    /// Get all employees (Admin only).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllEmployees([FromQuery] bool? activeOnly, [FromQuery] string? search)
    {
        IQueryable<Employee> query = _context.Employees.Include(e => e.Tasks);

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(e => e.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(e =>
                e.Name.ToLower().Contains(searchLower) ||
                e.Email.ToLower().Contains(searchLower) ||
                e.Department.ToLower().Contains(searchLower) ||
                e.Designation.ToLower().Contains(searchLower));
        }

        var employees = await query.OrderByDescending(e => e.CreatedAt).ToListAsync();

        var response = employees.Select(e => new EmployeeResponseDto
        {
            Id = e.Id,
            Name = e.Name,
            Email = e.Email,
            Department = e.Department,
            Designation = e.Designation,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt,
            TotalTasks = e.Tasks.Count,
            PendingTasks = e.Tasks.Count(t => t.Status == "Pending"),
            InProgressTasks = e.Tasks.Count(t => t.Status == "In Progress"),
            CompletedTasks = e.Tasks.Count(t => t.Status == "Completed")
        }).ToList();

        return Ok(response);
    }

    /// <summary>
    /// Get an employee by ID.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        var response = new EmployeeResponseDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Department = employee.Department,
            Designation = employee.Designation,
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt,
            TotalTasks = employee.Tasks.Count,
            PendingTasks = employee.Tasks.Count(t => t.Status == "Pending"),
            InProgressTasks = employee.Tasks.Count(t => t.Status == "In Progress"),
            CompletedTasks = employee.Tasks.Count(t => t.Status == "Completed")
        };

        return Ok(response);
    }

    /// <summary>
    /// Create a new employee (Admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var emailExists = await _context.Employees.AnyAsync(e => e.Email.ToLower() == dto.Email.ToLower());
        if (emailExists)
            return BadRequest(new { message = "An employee with this email address already exists." });

        var employee = new Employee
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Department = dto.Department.Trim(),
            Designation = dto.Designation.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        // Also ensure a login user exists for this employee so they can log in
        var userExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == employee.Email);
        if (!userExists)
        {
            var rawPassword = string.IsNullOrWhiteSpace(dto.Password) ? "Employee@123" : dto.Password;
            _context.Users.Add(new User
            {
                Name = employee.Name,
                Email = employee.Email,
                PasswordHash = _authService.HashPassword(rawPassword),
                Role = "Employee",
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        var response = new EmployeeResponseDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Department = employee.Department,
            Designation = employee.Designation,
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt,
            TotalTasks = 0,
            PendingTasks = 0,
            InProgressTasks = 0,
            CompletedTasks = 0
        };

        return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, response);
    }

    /// <summary>
    /// Update an existing employee (Admin only).
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = await _context.Employees
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        var emailExists = await _context.Employees.AnyAsync(e => e.Email.ToLower() == dto.Email.ToLower() && e.Id != id);
        if (emailExists)
            return BadRequest(new { message = "Another employee with this email address already exists." });

        var oldEmail = employee.Email;

        employee.Name = dto.Name.Trim();
        employee.Email = dto.Email.Trim().ToLower();
        employee.Department = dto.Department.Trim();
        employee.Designation = dto.Designation.Trim();
        employee.IsActive = dto.IsActive;

        // Synchronize email/name with User account if exists
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == oldEmail.ToLower());
        if (user != null)
        {
            user.Name = employee.Name;
            user.Email = employee.Email;
        }

        await _context.SaveChangesAsync();

        var response = new EmployeeResponseDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Department = employee.Department,
            Designation = employee.Designation,
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt,
            TotalTasks = employee.Tasks.Count,
            PendingTasks = employee.Tasks.Count(t => t.Status == "Pending"),
            InProgressTasks = employee.Tasks.Count(t => t.Status == "In Progress"),
            CompletedTasks = employee.Tasks.Count(t => t.Status == "Completed")
        };

        return Ok(response);
    }

    /// <summary>
    /// Soft delete / toggle deactivate employee (Admin only).
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        // Soft deletion as per requirement: deactivate employee
        employee.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Employee '{employee.Name}' was successfully deactivated.", employeeId = employee.Id, isActive = false });
    }
}
