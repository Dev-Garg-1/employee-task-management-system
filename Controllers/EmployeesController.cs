using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using EmployeeTaskManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        var employees = await _context.Employees
            .Include(e => e.Tasks)
            .ToListAsync();

        return Ok(employees);
    }

    // GET: api/employees/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        return Ok(employee);
    }

    // POST: api/employees
    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = new Employee
        {
            Name = dto.Name,
            Email = dto.Email,
            Department = dto.Department,
            Designation = dto.Designation,
            IsActive = true
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    // PUT: api/employees/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingEmployee = await _context.Employees.FindAsync(id);

        if (existingEmployee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        existingEmployee.Name = dto.Name;
        existingEmployee.Email = dto.Email;
        existingEmployee.Department = dto.Department;
        existingEmployee.Designation = dto.Designation;
        existingEmployee.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        await _context.Entry(existingEmployee).Collection(e => e.Tasks).LoadAsync();

        return Ok(existingEmployee);
    }

    // DELETE: api/employees/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}