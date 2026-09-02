namespace EmployeeTaskManagement.DTOs;

public class AdminDashboardStatsDto
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int TotalTasks { get; set; }
    public int PendingTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int CompletedTasks { get; set; }
    public List<TaskResponseDto> RecentTasks { get; set; } = new();
}

public class EmployeeDashboardStatsDto
{
    public int MyTotalTasks { get; set; }
    public int PendingTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int CompletedTasks { get; set; }
    public List<TaskResponseDto> RecentTasks { get; set; } = new();
}
