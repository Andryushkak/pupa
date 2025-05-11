const express = require('express');
const router = express.Router();
const database = require('../bace/DataBace');

// GET форма
router.get('/books/add', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('add-book');
});

// POST обробка
router.post('/books/add', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  const { title, author } = req.body;

  try {
    const user = await database.findUserById(req.user._id);
    user.books.push({ title, author });
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error('Помилка додавання книги:', err.message);
    res.status(500).send('Помилка сервера');
  }
});

module.exports = router;
