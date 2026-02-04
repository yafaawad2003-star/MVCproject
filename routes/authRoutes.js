const router = require("express").Router();
const c = require("../controllers/authController");

router.get("/login", c.getLogin);
router.post("/login", c.postLogin);

router.get("/register", c.getRegister);
router.post("/register", c.postRegister);

router.post("/logout", c.logout);

module.exports = router;
