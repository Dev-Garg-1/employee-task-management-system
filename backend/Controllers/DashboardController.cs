using System.Security.Claims;
using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get dashboard statistics based on the authenticated user's role.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboardStats()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (role == "Admin")
        {
            var totalEmployees = await _context.Employees.CountAsync();
            var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
            var totalTasks = await _context.Tasks.CountAsync();
            var pendingTasks = await _context.Tasks.CountAsync(t => t.Status == "Pending");
            var inProgressTasks = await _context.Tasks.CountAsync(t => t.Status == "In Progress");
            var completedTasks = await _context.Tasks.CountAsync(t => t.Status == "Completed");

            var recentTasks = await _context.Tasks
                .Include(t => t.AssignedEmployee)
                .Include(t => t.CreatedBy)
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new TaskResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    Status = t.Status,
                    DueDate = t.DueDate,
                    AssignedEmployeeId = t.AssignedEmployeeId,
                    AssignedEmployeeName = t.AssignedEmployee != null ? t.AssignedEmployee.Name : "Unassigned",
                    AssignedEmployeeEmail = t.AssignedEmployee != null ? t.AssignedEmployee.Email : null,
                    CreatedById = t.CreatedById,
                    CreatedByName = t.CreatedBy != null ? t.CreatedBy.Name : null,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(new AdminDashboardStatsDto
            {
                TotalEmployees = totalEmployees,
                ActiveEmployees = activeEmployees,
                TotalTasks = totalTasks,
                PendingTasks = pendingTasks,
                InProgressTasks = inProgressTasks,
                CompletedTasks = completedTasks,
                RecentTasks = recentTasks
            });
        }
        else
        {
            // Employee view
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email.ToLower() == email!.ToLower());
            if (employee == null)
            {
                return Ok(new EmployeeDashboardStatsDto
                {
                    MyTotalTasks = 0,
                    PendingTasks = 0,
                    InProgressTasks = 0,
                    CompletedTasks = 0,
                    RecentTasks = new List<TaskResponseDto>()
                });
            }

            var employeeTasksQuery = _context.Tasks.Where(t => t.AssignedEmployeeId == employee.Id);

            var myTotalTasks = await employeeTasksQuery.CountAsync();
            var pendingTasks = await employeeTasksQuery.CountAsync(t => t.Status == "Pending");
            var inProgressTasks = await employeeTasksQuery.CountAsync(t => t.Status == "In Progress");
            var completedTasks = await employeeTasksQuery.CountAsync(t => t.Status == "Completed");

            var recentTasks = await employeeTasksQuery
                .Include(t => t.AssignedEmployee)
                .Include(t => t.CreatedBy)
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new TaskResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    Status = t.Status,
                    DueDate = t.DueDate,
                    AssignedEmployeeId = t.AssignedEmployeeId,
                    AssignedEmployeeName = t.AssignedEmployee != null ? t.AssignedEmployee.Name : "Unassigned",
                    AssignedEmployeeEmail = t.AssignedEmployee != null ? t.AssignedEmployee.Email : null,
                    CreatedById = t.CreatedById,
                    CreatedByName = t.CreatedBy != null ? t.CreatedBy.Name : null,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(new EmployeeDashboardStatsDto
            {
                MyTotalTasks = myTotalTasks,
                PendingTasks = pendingTasks,
                InProgressTasks = inProgressTasks,
                CompletedTasks = completedTasks,
                RecentTasks = recentTasks
            });
        }
    }
}
