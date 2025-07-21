using Microsoft.EntityFrameworkCore;
using crud_App.Models;

namespace crud_App.Data
{
    public class GoalDbContext : DbContext
    {
        public GoalDbContext(DbContextOptions<GoalDbContext> options)
            : base(options)
        {
        }

        public DbSet<Goal> GOAL_TRACKER { get; set; }  // Exact SQL table name
    }
}
