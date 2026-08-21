namespace EmployeeTaskManagement.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";

    public DateTime DueDate { get; set; }

    public int AssignedEmployeeId { get; set; }

    public Employee? AssignedEmployee { get; set; }
}