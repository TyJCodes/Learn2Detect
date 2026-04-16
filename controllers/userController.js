const db = require('../models/database');

exports.getUserStats = (req, res) =>
{
    const userID = req.params.userID;

    const getUserStatsSql = 
    `SELECT points, rank, 
    current_streak, longest_streak,
    easy_correct_count, medium_correct_count, hard_correct_count
    FROM users_stats
    WHERE user_id = ?`;

    db.get(getUserStatsSql, [userID], (err,row) => 
    {
        if (err)
        {
            return res.status(500).json({ error: "Could not fetch the users stats."});
        }
        if(!row)
        {
            return res.status(404).json({ error: "User stats not found"});
        }

        res.json(row);
    });
};

exports.getUserAchievements = (req, res) =>
{
    const userID = req.params.userID;
    const getUserAchievementsSql = 
    `SELECT badge_name, date_earned FROM achievements WHERE user_id = ?`;
    db.all(getUserAchievementsSql, [userID], (err,rows) => 
    {
        if (err)
        {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    })

}
