namespace EmployeeTaskManagement.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserInfoDto User { get; set; } = new();
}

public class UserInfoDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
}
