[HttpGet("paged")]
[Authorize]
public async Task<IActionResult> GetGoalsPaged(int page = 1, int pageSize = 10)
{
    var userId = User.FindFirst("UserId")?.Value;

    if (userId == null)
        return Unauthorized();

    var offset = (page - 1) * pageSize;

    using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
    {
        string sql = @"
            SELECT * FROM GOAL_TRACKER
            WHERE UserId = @UserId
            ORDER BY Id
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;

            SELECT COUNT(*) FROM GOAL_TRACKER WHERE UserId = @UserId;
        ";

        using (var multi = await connection.QueryMultipleAsync(sql, new { UserId = userId, Offset = offset, PageSize = pageSize }))
        {
            var goals = (await multi.ReadAsync<GoalModel>()).ToList();
            var totalCount = await multi.ReadSingleAsync<int>();

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return Ok(new
            {
                currentPage = page,
                totalPages = totalPages,
                totalGoals = totalCount,
                goals = goals
            });
        }
    }
}
