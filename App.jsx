[Authorize]
[HttpGet("paged")]
public IActionResult GetPagedGoals(int page = 1, int pageSize = 10)
{
    try
    {
        var userId = User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in.");

        int skip = (page - 1) * pageSize;

        using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        {
            var goals = connection.Query<Goal>(
                @"SELECT * FROM GOAL_TRACKER 
                  WHERE UserId = @UserId 
                  ORDER BY GoalId 
                  OFFSET @Skip ROWS 
                  FETCH NEXT @PageSize ROWS ONLY",
                new { UserId = userId, Skip = skip, PageSize = pageSize }
            ).ToList();

            return Ok(goals);
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Something went wrong: {ex.Message}");
    }
}
