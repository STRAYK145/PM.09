const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { render } = require("ejs");

router.get("/", async (req, res) => {
    res.render("main")
}
)



router.get("/tasks", async (req, res) => {

    const userId = req.session.userId;

    if (!userId) {
        return res.redirect("/login");
    }

    try {

        const result = await db.query(
            `
            SELECT *
            FROM tasks
            WHERE user_id = $1
            ORDER BY id DESC
            `,
            [userId]
        );

        res.render("my_list", {
            tasks: result.rows
        });

    } catch (error) {

        console.log(error);

        res.send("Ошибка загрузки задач");

    }

});


router.get("/create", (req, res) => {

    res.render("create");

});

router.post("/create", async (req, res) => {

    const {
        title,
        description,
        status,
        priority,
        deadline
    } = req.body;

    const userId = req.session.userId;

    try {

        await db.query(
            `
            INSERT INTO tasks
            (
                title,
                description,
                status,
                priority,
                deadline,
                user_id
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6
            )
            `,
            [
                title,
                description,
                status,
                priority,
                deadline,
                userId
            ]
        );

        res.redirect("/tasks");

    } catch (error) {

        console.log(error);

        res.send("Ошибка создания задачи");

    }

});


router.get("/tasks/:id", async (req, res) => {

    const id = req.params.id;

    const taskResult = await db.query(
        `
        SELECT *
        FROM tasks
        WHERE id = $1
        `,
        [id]
    );

    const commentsResult = await db.query(
        `
        SELECT
            comments.*,
            users.username
        FROM comments
        JOIN users
            ON users.id = comments.user_id
        WHERE task_id = $1
        ORDER BY comments.created_at DESC
        `,
        [id]
    );

    res.render("prosmotr", {
        task: taskResult.rows[0],
        comments: commentsResult.rows
    });

});

router.post("/tasks/:id/comment", async (req, res) => {

    await db.query(
        `
        INSERT INTO comments
        (
            task_id,
            user_id,
            text
        )
        VALUES
        (
            $1,$2,$3
        )
        `,
        [
            req.params.id,
            req.session.userId,
            req.body.text
        ]
    );

    res.redirect("/tasks/" + req.params.id);

});

router.get("/tasks/edit/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const result = await db.query(
            `
            SELECT *
            FROM tasks
            WHERE id = $1
            `,
            [id]
        );

        res.render("edit", {
            task: result.rows[0]
        });

    } catch (error) {

        console.log(error);
        res.send("Ошибка загрузки задачи");

    }

});

router.post("/tasks/edit/:id", async (req, res) => {

    const id = req.params.id;

    const {
        title,
        description,
        status,
        priority,
        deadline
    } = req.body;

    try {

        await db.query(
            `
            UPDATE tasks
            SET
                title = $1,
                description = $2,
                status = $3,
                priority = $4,
                deadline = $5,
                updated_at = NOW()
            WHERE id = $6
            `,
            [
                title,
                description,
                status,
                priority,
                deadline,
                id
            ]
        );

        res.redirect("/tasks");

    } catch (error) {

        console.log(error);
        res.send("Ошибка обновления задачи");

    }

});

router.post("/tasks/delete/:id", async (req, res) => {

    const id = req.params.id;

    try {

        await db.query(
            `
            DELETE FROM tasks
            WHERE id = $1
            `,
            [id]
        );

        res.redirect("/tasks");

    } catch (error) {

        console.log(error);
        res.send("Ошибка удаления задачи");

    }

});

router.get("/profile", async (req, res) => {

    const userId = req.session.userId;

    if (!userId) {
        return res.redirect("/login");
    }

    try {

        const userResult = await db.query(
            `
            SELECT id, username, email, created_at
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        const tasksStats = await db.query(
            `
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Новая') AS new_tasks,
                COUNT(*) FILTER (WHERE status = 'В работе') AS in_progress,
                COUNT(*) FILTER (WHERE status = 'Выполнена') AS done
            FROM tasks
            WHERE user_id = $1
            `,
            [userId]
        );

        res.render("profile", {
            user: userResult.rows[0],
            stats: tasksStats.rows[0]
        });

    } catch (error) {

        console.log(error);
        res.send("Ошибка загрузки профиля");

    }

});

module.exports = router;