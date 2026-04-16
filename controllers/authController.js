const db = require('../models/database')
const bcrypt = require('bcrypt')
const workFactor = 12; // Salt rounds, makes the password harder to crack the higher the number.
const achievementServices = require('../utility/achievementServices');

// ACCOUNT CREATION ----------------------------------------
exports.signup = async (req, res) => 
{
    let {username, email, password} = req.body;

    // get rid of extra white spaces
    username = username ? username.trim() : "";
    email = email ? email.toLowerCase().trim() : "";

    // validation
    const validationError = validateSignup(username, email, password);
    if(validationError) // if the function returns something tell the user
    {
        return res.status(400).json({error: validationError});
    }
    try 
    {
        const passwordHash = await bcrypt.hash(password, workFactor);

        const insertUserInformationSql = `INSERT INTO users (username, email, password_hash) VALUES (?,?,?)`

        // Adds data to user table 
        db.run(insertUserInformationSql, [username, email, passwordHash], function(err)
        {
            if(err)
            {
                if (err.message.includes("UNIQUE"))
                {
                    return res.status(400).json({ error: "Username already exists or email is already in use for a different account."})
                }
                return res.status(500).json({ error: "Error with the database"})
            }
            // Adds data to users_stats table based on the id auto generated from sqlite
            console.log("ID to be inserted into user_stats is: " + this.lastID)
            db.run(`INSERT INTO users_stats (user_id) VALUES (?)`, [this.lastID], (err2) =>
            {
                if(err2)
                {
                console.error("Stats Table error: ", err2.message);
                return res.json({message: "User created, but stats failed to load"});
                }
                res.json({ message: "Signup was successful. enjoy Learn2Detect!"});
            });
        });
    }
    catch (e)
    {
        res.status(500).json({ error: "Server error during hashing process"});
    }
};

// Validation for sign up
function validateSignup(username,email,password)
{
    if (!username || !email || !password)
    {
        return "Must have all fields done.";
    }
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/; 
    if (!usernameRegex.test(username))
    {
        return "Username must be 5-20 characters and contain only letters, numbers and underscores.";
    }
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email))
    {
        return "Please enter a valid email address.";
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,30}$/;
    if (!passwordRegex.test(password))
    {
        return "Password must be 8-30 characters, include upper and lowercase, a number and a special symbol.";
    }
    return null; // username, email and password are all fine.
}

// LOGIN

// ACCOUNT LOGIN --------------------------------------
exports.login = (req, res) => 
{
    let { username,password } = req.body;
    username = username.trim();

    const findUserSql = `SELECT * FROM users WHERE username = ?`;

    db.get(findUserSql, [username], (err, user) => {
        if (err) return res.status(500).json({ error: "There is a database error"});
        if (!user) return res.status(400).json({ error: "User cant be found"});

        if (bcrypt.compareSync(password, user.password_hash)) // if correct password
        {

            updateLoginStreak(user.id);

            res.json
            ({
                message: "Login successful!",
                user: {id: user.id, username: user.username }
            });
        }
        else{ res.status(401).json({error: "Incorrect password"}); }
    
    });
};

function updateLoginStreak(userID)
{
    const loginInfoSql = `SELECT last_login, current_streak, longest_streak FROM users_stats WHERE user_id = ?`;

    db.get(loginInfoSql, [userID], (err, stats) =>
    {
        if (err || !stats) return;


        // current login
        const currentDate = new Date();
        const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();

        // Last login
        let lastLoginDate = stats.last_login ? new Date(stats.last_login) : null;
        let lastLoginMidnight = lastLoginDate ? new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate()).getTime() : 0;

        // seconds * 1000 to get milliseconds
        const dayMilliseconds = 86400 * 1000;
        const diff = currentMidnight - lastLoginMidnight;

        let currentStreak = stats.current_streak;
        let longestStreak = stats.longest_streak;

        if (diff === dayMilliseconds)
        {
            currentStreak += 1;
        }
        else if (diff > dayMilliseconds || lastLoginDate === null)
        {
            currentStreak = 1; 
        }
        // if diff === 0 do nothing because they have already logged in today

        if (currentStreak > longestStreak)
        {
            longestStreak = currentStreak;
        }

        const updateStreaksQuery = `UPDATE users_stats SET
        current_streak = ?,
        longest_streak = ?,
        last_login = CURRENT_TIMESTAMP
        WHERE user_id =?`

        db.run(updateStreaksQuery , [currentStreak, longestStreak, userID], (err) =>
        {
            if (!err)
            {
                console.log("Streak updated for User " + userID + " Current streak is now " + currentStreak + " days");
                achievementServices.checkAchievements(userID); // check if they get any achievements for this.
            }
        })
    })
}