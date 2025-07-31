[HttpGet]
public async Task<ActionResult<IEnumerable<Goal>>> GetGoals(int pageNumber = 1, int pageSize = 10)
{
    if (pageNumber < 1 || pageSize < 1)
        return BadRequest("Invalid page number or size");

    var query = _context.GOAL_TRACKER
                        .Where(g => g.UserId == CurrentUserId);

    var totalGoals = await query.CountAsync();
    var totalPages = (int)Math.Ceiling(totalGoals / (double)pageSize);

    var goals = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

    // Optional: add pagination metadata in headers
    Response.Headers.Add("X-Total-Count", totalGoals.ToString());
    Response.Headers.Add("X-Total-Pages", totalPages.ToString());

    return goals;
}
