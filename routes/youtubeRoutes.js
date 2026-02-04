const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const c = require("../controllers/youtubeController");

router.get("/youtube", requireAuth, c.getYoutubePage);
router.post("/youtube/favorite", requireAuth, c.postAddFavorite);
router.post("/youtube/favorite/delete", requireAuth, c.postDeleteFavorite);

module.exports = router;
