using Microsoft.EntityFrameworkCore;
using EmployeeTaskManagement.Models;

namespace EmployeeTaskManagement.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}