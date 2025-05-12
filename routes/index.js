const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const database = require('../bace/DataBace');

// Головна сторінка з пошуком і книгами
router.get('/', async (req, res) => {
  const searchQuery = req.query.q || '';
  let books = [];

  try {
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      books = await Book.find({
        $or: [{ title: regex }, { author: regex }]
      });
    } else {
      books = await Book.find();
    }

    res.render('index', {
      user: req.user,
      books,
      searchQuery
    });
  } catch (err) {
    console.error('Помилка завантаження книг:', err.message);
    res.render('index', { user: req.user, books: [], searchQuery });
  }
});


// Профіль користувача за ID
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