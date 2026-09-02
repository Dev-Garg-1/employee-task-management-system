using Microsoft.EntityFrameworkCore;
using EmployeeTaskManagement.Models;

namespace EmployeeTaskManagement.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasMaxLength(50);
        });

        // Employee configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Designation).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).IsRequired();
        });

        // TaskItem configuration
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Priority).IsRequired().HasMaxLength(20);
            entity.Property(t => t.Status).IsRequired().HasMaxLength(20);

            // Employee -> Tasks relationship (1 to many)
            entity.HasOne(t => t.AssignedEmployee)
                  .WithMany(e => e.Tasks)
                  .HasForeignKey(t => t.AssignedEmployeeId)
                  .OnDelete(DeleteBehavior.Restrict);

            // User -> Tasks relationship (1 to many)
            entity.HasOne(t => t.CreatedBy)
                  .WithMany(u => u.CreatedTasks)
                  .HasForeignKey(t => t.CreatedById)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
