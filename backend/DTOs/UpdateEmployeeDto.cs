using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class UpdateEmployeeDto
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Department is required")]
    public string Department { get; set; } = string.Empty;

    [Required(ErrorMessage = "Designation is required")]
    public string Designation { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
