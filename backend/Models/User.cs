using System.Text.Json.Serialization;

namespace EmployeeTaskManagement.Models;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "Employee"; // "Admin" or "Employee"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
}
