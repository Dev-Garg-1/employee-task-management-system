namespace EmployeeTaskManagement.DTOs;

public class TaskResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "Pending";
    public DateTime DueDate { get; set; }
    public int AssignedEmployeeId { get; set; }
    public string AssignedEmployeeName { get; set; } = string.Empty;
    public string? AssignedEmployeeEmail { get; set; }
    public int? CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
