namespace EmployeeTaskManagement.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium"; // "Low", "Medium", "High"

    public string Status { get; set; } = "Pending"; // "Pending", "In Progress", "Completed"

    public DateTime DueDate { get; set; }

    public int AssignedEmployeeId { get; set; }

    public Employee? AssignedEmployee { get; set; }

    public int? CreatedById { get; set; }

    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
