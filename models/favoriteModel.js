const db = require("../db/init");

function listByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function addFavorite(userId, v) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO favorites (user_id, video_id, title, thumbnail_url, channel_title)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, v.video_id, v.title, v.thumbnail_url, v.channel_title],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function removeFavorite(userId, videoId) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM favorites WHERE user_id = ? AND video_id = ?",
      [userId, videoId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = { listByUser, addFavorite, removeFavorite };
