const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./learn2detect.db', (err) => 
{
    if (err) 
    {
        console.error("Error."  , err.message)
    }
    else
    {
        console.log("Database connected")
    }

    createTables();
})

function createTables()
{
    db.serialize(() => 
    {
        db.run(`CREATE TABLE IF NOT EXISTS users
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS users_stats
            (
            user_id INTEGER PRIMARY KEY,
            points INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 1,
            rank TEXT DEFAULT 'Beginner',
            easy_correct_count INTEGER DEFAULT 0,
            medium_correct_count INTEGER DEFAULT 0,
            hard_correct_count INTEGER DEFAULT 0,
            last_login DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id)
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS achievements
            (
            achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_name TEXT NOT NULL,
            date_earned DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, badge_name)
            )`);
    //db.run(`DROP TABLE achievements`)
    })
}

module.exports = db;