const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "praktika_l",
        resave: false,
        saveUninitialized: false
    })
);

app.use((req, res, next) => {

    res.locals.userId = req.session.userId;
    res.locals.isAdmin = req.session.isAdmin;

    next();
});

app.use("/", authRoutes);
app.use("/", requestRoutes);
app.use("/", adminRoutes);

app.listen(3000, () => {
    console.log("Server started: http://localhost:3000");
});