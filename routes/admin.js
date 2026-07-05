const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/admin", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.redirect("/login");
    }

    try {

        const users = await db.query(`
            SELECT
                users.id,
                users.username,
                users.email,
                COUNT(tasks.id) AS tasks_count
            FROM users
            LEFT JOIN tasks
                ON tasks.user_id = users.id
            GROUP BY users.id
            ORDER BY users.id
        `);

        const stats = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS users_count,
                (SELECT COUNT(*) FROM tasks) AS tasks_count,
                (SELECT COUNT(*) FROM tasks WHERE status='Выполнена') AS completed_count
        `);

        res.render("admin", {
            users: users.rows,
            stats: stats.rows[0]
        });

    } catch (error) {

        console.log(error);
        res.send("Ошибка");

    }

});

router.post("/admin/user/:id/delete", async (req, res) => {

    if (!req.session.isAdmin) {
        return res.redirect("/login");
    }

    try {

        await db.query(
            `
            DELETE FROM users
            WHERE id = $1
            `,
            [req.params.id]
        );

        res.redirect("/admin");

    } catch (error) {

        console.log(error);
        res.send("Ошибка удаления пользователя");

    }

});



module.exports = router;