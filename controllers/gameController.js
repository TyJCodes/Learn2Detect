const db = require('../models/database.js');
const achievementServices = require('../utility/achievementServices');

// UPDATE SCORE ----------------------------------
exports.updateScore = (req, res) =>
{
    const { userID, difficulty, correct} = req.body
    const pointsPerDifficulty = {
        'Easy': {win: 10, loss: -5},
        'Medium': {win: 25, loss: -15},
        'Hard': {win: 50, loss: -35}
    }

    // if correct is passed in as true take the win value from pointsPerDifficulty
    const points = correct ? pointsPerDifficulty[difficulty].win : pointsPerDifficulty[difficulty].loss;

    let updateUserPointsSQL;
    if(correct)
    {
        const noOfCorrectAnswers = difficulty.toLowerCase() + "_correct_count";
        updateUserPointsSQL = `UPDATE users_stats
        SET points = points + ?,
        ${noOfCorrectAnswers} = ${noOfCorrectAnswers} + 1
        WHERE user_id = ?`;
    }
    else
    {
        // use MAX so that the user can not get negative points
        updateUserPointsSQL = `UPDATE users_stats
        SET points = MAX(0, points + ?)
        WHERE user_id = ?`;
    }
    db.run(updateUserPointsSQL, [points, userID], function(err)
    {
        if (err)
        {
            return res.status(500).json({error: "Could not update score"});
        }
        res.json({message: "Score updated", pointsUpdated: points});
    });
        db.get(`SELECT points FROM users_stats WHERE user_id = ?`,[userID], (err, user) =>
        {
            if(user)
            {
                updateRank(userID, user.points);
            }
        });
    achievementServices.checkAchievements(userID); // check if they get any achievements for this.
};

// Ranks ---------------------------------
function updateRank(userID, currentPoints)
{
    let rank="Beginner";

    if (currentPoints >= 10000) {rank="Phisherman";}
    else if (currentPoints >= 7500) {rank="Diamond 1";}
    else if (currentPoints >= 5000) {rank="Diamond 2";}
    else if (currentPoints >= 3500) {rank="Platinum 1";}
    else if (currentPoints >= 2500) {rank="Platinum 2";}
    else if (currentPoints >= 1750) {rank="Gold 1";}
    else if (currentPoints >= 1250) {rank="Gold 2";}
    else if (currentPoints >= 1000) {rank="Silver 1";}
    else if (currentPoints >= 800) {rank="Silver 2";}
    else if (currentPoints >= 500) {rank="Bronze 1";}
    else if (currentPoints >= 250) {rank="Bronze 2";}
    else if (currentPoints >= 100) {rank="Iron 1";}
    else if (currentPoints >= 50) {rank="Iron 2";}

const rankUpdateSQL = `UPDATE users_stats SET rank = ? WHERE user_id = ?`

db.run(rankUpdateSQL, [rank, userID], (err)=> 
{
    if (err)
    {
        console.error("Cant update rank" + err.message);
    }
    else
    {
        console.log("User " + userID + " now has " + currentPoints + " points giving them the " + rank + " rank.")
    }
})
}
