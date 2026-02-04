// server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const expressLayouts = require("express-ejs-layouts");

require("./db/init"); // create tables

const authRoutes = require("./routes/authRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");

const app = express();

// EJS + Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // views/layout.ejs

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Sessions in SQLite (db/sessions.db)
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: path.join(__dirname, "db"),
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 6 }, // 6 hours
  })
);

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/", youtubeRoutes);

// Home
app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("home", { title: "Home" });
});

// Default
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.redirect("/login");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
