const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/login", async(req,res) =>{
    res.render("login")
}
)

router.get("/registration", async(req,res) =>{
    res.render("register")
}
)


router.post("/register", async (req, res) => {

    const {
        username,
        email,
        password
    } = req.body;

    try {

        await db.query(
            `
            INSERT INTO users
            (
                username,
                email,
                password
            )
            VALUES
            (
                $1,$2,$3
            )
            `,
            [
                username,
                email,
                password
            ]
        );

        res.redirect("/login");

    } catch (error) {

        console.log(error);

        res.send("Ошибка регистрации");

    }

});

// Авторизация
router.post("/login", async (req, res) => {

    const {
        login,
        password
    } = req.body;

    try {

        // Администратор
        if (
            login === "admin" &&
            password === "1234"
        ) {

            req.session.isAdmin = true;

            return res.redirect("/admin");

        }

        const result = await db.query(
            `
            SELECT *
            FROM users
            WHERE username = $1
            AND password = $2
            `,
            [
                login,
                password
            ]
        );

        if (result.rows.length === 0) {

            return res.send("Неверный логин или пароль");

        }

        const user = result.rows[0];

        req.session.userId = user.id;
        req.session.username = user.username;

        res.redirect("/tasks");

    } catch (error) {

        console.log(error);

        res.send("Ошибка авторизации");

    }

});

// Выход
router.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login");

    });

});


module.exports = router;