using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using crud_App.Data;
using crud_App.Models;

namespace crud_App.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoalsController : ControllerBase
    {
        private readonly GoalDbContext _context;

        public GoalsController(GoalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Goal>>> GetGoals()
        {
            return await _context.GOAL_TRACKER.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Goal>> AddGoal(Goal goal)
        {
            _context.GOAL_TRACKER.Add(goal);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, goal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, Goal goal)
        {
            if (id != goal.Id) return BadRequest();

            _context.Entry(goal).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var goal = await _context.GOAL_TRACKER.FindAsync(id);
            if (goal == null) return NotFound();

            _context.GOAL_TRACKER.Remove(goal);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
