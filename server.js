const express = require('express');
const db = require('./models/database');
const app = express();

app.use(express.json());
app.use(express.static('view'));
app.use('/data', express.static('data'));

const bcrypt = require('bcrypt');
const workFactor = 12; // Salt rounds, makes the password harder to crack the higher the number.

const authController = require('./controllers/authController');
const achievementController = require('./controllers/achievementsController');
const gameController = require('./controllers/gameController');
const userController = require('./controllers/userController');


const { checkAchievements } = require('./utility/achievementServices');

app.get('/api/status', (req,res) =>
{
    res.json({message: "Server is running and connected"});
});



// ACCOUNT LOGIN --------------------------------------
app.post('/api/login', authController.login);

// ACCOUNT CREATION ----------------------------------------
app.post('/api/signup', authController.signup);

// ACHIEVEMENTS ---------------------------------------------------------------------
app.get('/api/user-achievement/:userID', achievementController.getUserAchievements);

// STATS -------------------------------------------------------
app.get('/api/user/stats/:userID', userController.getUserStats);

// UPDATE SCORE --------------------------------------------
app.post('/api/update-score', gameController.updateScore);

// LEADERBOARD ----------------------------
app.get('/api/leaderboard', (req,res) => 
{

    const pageNo = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (pageNo - 1) * limit;

    const sql = 
    `SELECT users.username, users_stats.points, users_stats.rank, users_stats.current_streak
    FROM users
    JOIN users_stats ON users.id = users_stats.user_id
    ORDER BY users_stats.points DESC
    LIMIT ? OFFSET ?`;

    db.all(sql, [limit, offset], (err, rows) =>
    {
        if (err)
        {
            return res.status(500).json({error: "Could not fetch the leaderboard"}); 
        }
        res.json(rows);
    });
});


app.listen(3000, () =>
{
    console.log("Server running on http://localhost:3000");
});