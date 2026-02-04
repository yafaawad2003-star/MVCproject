const bcrypt = require("bcrypt");
const User = require("../models/userModel");

exports.getLogin = (req, res) => {
  res.render("login", { title: "Login", error: null });
};

exports.postLogin = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.render("login", { title: "Login", error: "אימייל או סיסמה לא נכונים" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.render("login", { title: "Login", error: "אימייל או סיסמה לא נכונים" });

    req.session.user = { id: user.id, email: user.email, full_name: user.full_name };
    return res.redirect("/home");
  } catch (e) {
    return res.render("login", { title: "Login", error: "שגיאה בהתחברות" });
  }
};

exports.getRegister = (req, res) => {
  res.render("register", { title: "Register", error: null });
};

exports.postRegister = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const fullName = (req.body.full_name || "").trim();
  const password = req.body.password || "";

  if (!email || !fullName || !password) {
    return res.render("register", { title: "Register", error: "נא למלא את כל השדות" });
  }

  try {
    const exists = await User.findByEmail(email);
    if (exists) {
      return res.render("register", { title: "Register", error: "האימייל כבר קיים" });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = await User.createUser(email, fullName, hash);

    req.session.user = { id, email, full_name: fullName };
    return res.redirect("/home");
  } catch (e) {
    return res.render("register", { title: "Register", error: "שגיאה בהרשמה" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
