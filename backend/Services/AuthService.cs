using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeTaskManagement.Models;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeTaskManagement.Services;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
    string GenerateJwtToken(User user, int? employeeId = null);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }

    public string GenerateJwtToken(User user, int? employeeId = null)
    {
        var secretKey = _configuration["Jwt:Secret"] ?? _configuration["JWT_SECRET"] ?? "SuperSecretEmployeeTaskManagementSecretKey2026!#$*";
        var issuer = _configuration["Jwt:Issuer"] ?? _configuration["JWT_ISSUER"] ?? "EmployeeTaskManagement";
        var audience = _configuration["Jwt:Audience"] ?? _configuration["JWT_AUDIENCE"] ?? "EmployeeTaskManagementClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("userId", user.Id.ToString())
        };

        if (employeeId.HasValue)
        {
            claims.Add(new Claim("employeeId", employeeId.Value.ToString()));
        }

        var expiresMinutesStr = _configuration["Jwt:ExpiresInMinutes"] ?? "1440"; // 24 hours
        if (!double.TryParse(expiresMinutesStr, out double expiresMinutes))
        {
            expiresMinutes = 1440;
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiresMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
