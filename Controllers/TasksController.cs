using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using EmployeeTaskManagement.Models;
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

    // GET: api/tasks
    // Option to filter by employeeId or status: /api/tasks?employeeId=1&status=Pending
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] int? employeeId, [FromQuery] string? status)
    {
        IQueryable<TaskItem> query = _context.Tasks
            .Include(t => t.AssignedEmployee);

        if (employeeId.HasValue)
        {
            query = query.Where(t => t.AssignedEmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status.ToLower() == status.ToLower());
        }

        var tasks = await query.ToListAsync();
        return Ok(tasks);
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.AssignedEmployee)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        return Ok(task);
    }

    // GET: api/tasks/employee/2
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetTasksByEmployee(int employeeId)
    {
        var employeeExists = await _context.Employees.AnyAsync(e => e.Id == employeeId);
        if (!employeeExists)
            return NotFound(new { message = $"Employee with ID {employeeId} was not found." });

        var tasks = await _context.Tasks
            .Include(t => t.AssignedEmployee)
            .Where(t => t.AssignedEmployeeId == employeeId)
            .ToListAsync();

        return Ok(tasks);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = await _context.Employees.FindAsync(dto.AssignedEmployeeId);
        if (employee == null)
        {
            return BadRequest(new { message = $"Cannot assign task. Employee with ID {dto.AssignedEmployeeId} does not exist." });
        }

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Medium" : dto.Priority,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
            DueDate = dto.DueDate,
            AssignedEmployeeId = dto.AssignedEmployeeId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Load employee data for response
        await _context.Entry(task).Reference(t => t.AssignedEmployee).LoadAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        // If employee assignment is changing, check if new employee exists
        if (existingTask.AssignedEmployeeId != dto.AssignedEmployeeId)
        {
            var employeeExists = await _context.Employees.AnyAsync(e => e.Id == dto.AssignedEmployeeId);
            if (!employeeExists)
            {
                return BadRequest(new { message = $"Cannot reassign task. Employee with ID {dto.AssignedEmployeeId} does not exist." });
            }
        }

        existingTask.Title = dto.Title;
        existingTask.Description = dto.Description;
        existingTask.Priority = dto.Priority;
        existingTask.Status = dto.Status;
        existingTask.DueDate = dto.DueDate;
        existingTask.AssignedEmployeeId = dto.AssignedEmployeeId;

        await _context.SaveChangesAsync();

        await _context.Entry(existingTask).Reference(t => t.AssignedEmployee).LoadAsync();

        return Ok(existingTask);
    }

    // PATCH: api/tasks/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        existingTask.Status = dto.Status;

        await _context.SaveChangesAsync();

        await _context.Entry(existingTask).Reference(t => t.AssignedEmployee).LoadAsync();

        return Ok(existingTask);
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with ID {id} was not found." });

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
