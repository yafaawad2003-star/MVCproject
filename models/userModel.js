const db = require("../db/init");

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createUser(email, fullName, passwordHash) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)",
      [email, fullName, passwordHash],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

module.exports = { findByEmail, createUser };
