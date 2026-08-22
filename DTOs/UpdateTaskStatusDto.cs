using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class UpdateTaskStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
