using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class UpdateTaskStatusDto
{
    [Required(ErrorMessage = "Status is required")]
    [RegularExpression("^(Pending|In Progress|Completed)$", ErrorMessage = "Status must be 'Pending', 'In Progress', or 'Completed'")]
    public string Status { get; set; } = string.Empty;
}
