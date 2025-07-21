
[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly AppDbContext _context;

    public GoalsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Goal>>> GetGoals() => await _context.Goals.ToListAsync();

    [HttpPost]
    public async Task<IActionResult> AddGoal(Goal goal)
    {
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();
        return Ok(goal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGoal(int id, Goal updated)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null) return NotFound();

        goal.GoalText = updated.GoalText;
        goal.IsCompleted = updated.IsCompleted;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null) return NotFound();

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
