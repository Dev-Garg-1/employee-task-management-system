using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class UpdateEmployeeDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Department { get; set; } = string.Empty;

    [Required]
    public string Designation { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
