using System.ComponentModel.DataAnnotations;

namespace EmployeeTaskManagement.DTOs;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [RegularExpression("^(Low|Medium|High)$", ErrorMessage = "Priority must be 'Low', 'Medium', or 'High'")]
    public string Priority { get; set; } = "Medium";

    [RegularExpression("^(Pending|In Progress|Completed)$", ErrorMessage = "Status must be 'Pending', 'In Progress', or 'Completed'")]
    public string Status { get; set; } = "Pending";

    [Required(ErrorMessage = "Due date is required")]
    public DateTime DueDate { get; set; }

    [Required(ErrorMessage = "Assigned employee is required")]
    [Range(1, int.MaxValue, ErrorMessage = "A valid employee must be assigned")]
    public int AssignedEmployeeId { get; set; }
}
