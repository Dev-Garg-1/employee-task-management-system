using System.Security.Claims;
using EmployeeTaskManagement.Data;
using EmployeeTaskManagement.DTOs;
using EmployeeTaskManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTaskManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public AuthController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    /// <summary>
    /// Authenticate a user and return a JWT token with user info.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null || !_authService.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        int? employeeId = null;
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email.ToLower() == user.Email.ToLower());
        if (employee != null)
        {
            if (!employee.IsActive && user.Role != "Admin")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "Your employee account has been deactivated. Please contact an administrator." });
            }
            employeeId = employee.Id;
        }

        var token = _authService.GenerateJwtToken(user, employeeId);

        var response = new AuthResponseDto
        {
            Token = token,
            User = new UserInfoDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                EmployeeId = employeeId
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Get the current authenticated user's profile.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Unauthorized(new { message = "User not found in token." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound(new { message = "User record not found." });

        int? employeeId = null;
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == user.Email);
        if (employee != null)
        {
            employeeId = employee.Id;
        }

        return Ok(new UserInfoDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            EmployeeId = employeeId
        });
    }
}
