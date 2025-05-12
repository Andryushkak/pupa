const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bookStorage } = require('../config/cloudinary');
const upload = multer({ storage: bookStorage });
const Book = require('../models/Book');

// GET форма додавання книги
router.get('/books/add', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('add-book');
});

// POST додавання книги
router.post('/books/add', upload.single('cover'), async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  const { title, author, description, year, genre } = req.body;

  try {
    const book = new Book({
      title,
      author,
      description,
      year,
      genre,
      coverImage: req.file ? req.file.path : null,
      addedBy: req.user._id
    });

    await book.save();
    res.redirect('/');
  } catch (err) {
    console.error('Помилка додавання книги:', err.message);
    res.status(500).send('Помилка сервера');
  }
});

// GET перегляд окремої книги
router.get('/books/:id', async (req, res) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Книгу не знайдено');
    }
    res.render('book', { book });
  } catch (err) {
    console.error('Помилка при отриманні книги:', err.message);
    res.status(500).send('Помилка серверу');
  }
});

module.exports = router;
