using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class UpdateTaskDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";

    public DateTime DueDate { get; set; }

    [Required]
    public int AssignedEmployeeId { get; set; }
}
