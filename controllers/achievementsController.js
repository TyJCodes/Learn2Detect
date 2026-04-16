const db = require('../models/database.js');

// ACHIEVEMENT API Route
exports.getUserAchievements = (req,res) => 
{
    const userID = req.params.userID;
    const findUserAchievementsSQL = `SELECT badge_name, date_earned FROM achievements WHERE user_id = ?`;

    db.all(findUserAchievementsSQL, [userID], (err, rows) => {
        if(err)
        {
            console.error("Cant fetch achievements" + err.message);
            return res.status(500).json({ error: "cant fetch achievements"});
        }
        res.json(rows);
    });
};