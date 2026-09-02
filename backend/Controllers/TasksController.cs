using System.Security.Claims;
using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using EmployeeTaskManagement.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private static TaskResponseDto MapToDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority,
            Status = task.Status,
            DueDate = task.DueDate,
            AssignedEmployeeId = task.AssignedEmployeeId,
            AssignedEmployeeName = task.AssignedEmployee != null ? task.AssignedEmployee.Name : "Unassigned",
            AssignedEmployeeEmail = task.AssignedEmployee?.Email,
            CreatedById = task.CreatedById,
            CreatedByName = task.CreatedBy?.Name,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    private async Task<int?> GetCurrentEmployeeIdAsync()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return null;

        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email.ToLower() == email.ToLower());
        return employee?.Id;
    }

    /// <summary>
    /// Get tasks. Admins view all tasks; Employees view only tasks assigned to them.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTasks([FromQuery] int? employeeId, [FromQuery] string? status, [FromQuery] string? priority, [FromQuery] string? search)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var isEmployee = role == "Employee";

        IQueryable<TaskItem> query = _context.Tasks
            .Include(t => t.AssignedEmployee)
            .Include(t => t.CreatedBy);

        if (isEmployee)
        {
            var myEmployeeId = await GetCurrentEmployeeIdAsync();
            if (!myEmployeeId.HasValue)
            {
                return Ok(new List<TaskResponseDto>());
            }
            query = query.Where(t => t.AssignedEmployeeId == myEmployeeId.Value);
        }
        else if (employeeId.HasValue)
        {
            query = query.Where(t => t.AssignedEmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(t => t.Priority.ToLower() == priority.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(searchLower) ||
                t.Description.ToLower().Contains(searchLower) ||
                (t.AssignedEmployee != null && t.AssignedEmployee.Name.ToLower().Contains(searchLower)));
        }

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(tasks.Select(MapToDto));
    }

    /// <summary>
    /// Get task by ID.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.AssignedEmployee)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Employee")
        {
            var myEmployeeId = await GetCurrentEmployeeIdAsync();
            if (task.AssignedEmployeeId != myEmployeeId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not authorized to view this task." });
            }
        }

        return Ok(MapToDto(task));
    }

    /// <summary>
    /// Create a new task (Admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = await _context.Employees.FindAsync(dto.AssignedEmployeeId);
        if (employee == null)
        {
            return BadRequest(new { message = $"Cannot assign task. Employee with ID {dto.AssignedEmployeeId} does not exist." });
        }

        int? currentUserId = null;
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("userId");
        if (int.TryParse(userIdClaim, out int parsedUserId))
        {
            currentUserId = parsedUserId;
        }

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Priority = dto.Priority,
            Status = dto.Status,
            DueDate = DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc),
            AssignedEmployeeId = dto.AssignedEmployeeId,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _context.Entry(task).Reference(t => t.AssignedEmployee).LoadAsync();
        if (task.CreatedById.HasValue)
        {
            await _context.Entry(task).Reference(t => t.CreatedBy).LoadAsync();
        }

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, MapToDto(task));
    }

    /// <summary>
    /// Update a task (Admin only).
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.Tasks
            .Include(t => t.AssignedEmployee)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        if (task.AssignedEmployeeId != dto.AssignedEmployeeId)
        {
            var employeeExists = await _context.Employees.AnyAsync(e => e.Id == dto.AssignedEmployeeId);
            if (!employeeExists)
            {
                return BadRequest(new { message = $"Cannot reassign task. Employee with ID {dto.AssignedEmployeeId} does not exist." });
            }
        }

        task.Title = dto.Title.Trim();
        task.Description = dto.Description.Trim();
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.DueDate = DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc);
        task.AssignedEmployeeId = dto.AssignedEmployeeId;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(task).Reference(t => t.AssignedEmployee).LoadAsync();

        return Ok(MapToDto(task));
    }

    /// <summary>
    /// Update task status (Admin or Assigned Employee).
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.Tasks
            .Include(t => t.AssignedEmployee)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == "Employee")
        {
            var myEmployeeId = await GetCurrentEmployeeIdAsync();
            if (task.AssignedEmployeeId != myEmployeeId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "You can only update status for tasks assigned to you." });
            }
        }

        task.Status = dto.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(task));
    }

    /// <summary>
    /// Delete a task (Admin only).
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Task deleted successfully.", taskId = id });
    }
}
