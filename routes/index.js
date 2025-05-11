const express = require('express');
const router = express.Router();
const database = require('../bace/DataBace');

// Пример використання функції:
router.get('/user/:id', async (req, res) => {
    try {
        const user = await database.findUserById(req.params.id);
        if (!user) {
            return res.status(404).send('Користувача не знайдено');
        }
        res.render('profile', { user });
    } catch (err) {
        console.error("Помилка пошуку користувача:", err.message);
        res.status(500).send('Помилка сервера');
    }
});

module.exports = router;
