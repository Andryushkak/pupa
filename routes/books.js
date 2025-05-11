const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // обов’язково створити config/cloudinary.js
const upload = multer({ storage });

const Book = require('../models/Book');

// GET форма
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

router.get('/my-books', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  try {
    const books = await Book.find({ addedBy: req.user._id }).sort({ createdAt: -1 });
    res.render('my-books', { books });
  } catch (err) {
    console.error('Помилка завантаження книг:', err.message);
    res.status(500).send('Помилка сервера');
  }
});

module.exports = router;
