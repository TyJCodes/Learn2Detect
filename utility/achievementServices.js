
const db = require('../models/database.js');

// Achievements --------------------------
exports.checkAchievements = function(userID)
{
    console.log("Checking achievements now.")
    const getUserStatsSQL = `SELECT * FROM users_stats WHERE user_id = ?`;

    db.get(getUserStatsSQL, [userID], (err, stats) => 
    {
        if (err || !stats) { return; }

        const achievements = [];

        // Difficulty specific achievements -------------
        // Easy phishing
        if (stats.easy_correct_count >= 10) achievements.push("Easy Apprentice");
        if (stats.easy_correct_count >= 50) achievements.push("Easy Expert");
        if (stats.easy_correct_count >= 200) achievements.push("Easy Master");

        // Medium phishing
        if (stats.medium_correct_count >= 10) achievements.push("Medium Apprentice");
        if (stats.medium_correct_count >= 50) achievements.push("Medium Expert");
        if (stats.medium_correct_count >= 200) achievements.push("Medium Master");

        // Hard phishing
        if (stats.hard_correct_count >= 10) achievements.push("Hard Apprentice");
        if (stats.hard_correct_count >= 50) achievements.push("Hard Expert");
        if (stats.hard_correct_count >= 200) achievements.push("Hard Master");

        // Rank Based achievements --------------------------
        if (stats.rank === "Gold 2") achievements.push("Phish Hunter");
        if (stats.rank === "Diamond 2") achievements.push("Cyber Master");
        if (stats.rank === "Phisherman") achievements.push("The Human Firewall");

        // Points based achievements -----------------------
        if (stats.points >= 5000) achievements.push("Halfway there");
        if (stats.points >= 9949) achievements.push("So close...");
        if (stats.points >= 15000) achievements.push("Above and beyond");

        // Login streak achievements ------------------------
        if (stats.longest_streak >= 3) achievements.push("Player");
        if (stats.longest_streak >= 7) achievements.push("Consistent");
        if (stats.longest_streak >= 14) achievements.push("Grinder");

        // Loop to add any achievements the user has
        achievements.forEach(badgeName =>
        {
            console.log("Inserting " + badgeName + " achievement for user " + userID);
            db.run(`INSERT OR IGNORE INTO achievements (user_id, badge_name, date_earned)
                VALUES (?,?, CURRENT_TIMESTAMP)`, [userID, badgeName]);
        });
    });
}