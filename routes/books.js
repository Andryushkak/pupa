const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bookStorage } = require('../config/cloudinary');
const upload = multer({ storage: bookStorage });
;

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

router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    let books;

    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      books = await Book.find({
        $or: [{ title: regex }, { author: regex }]
      });
    } else {
      books = await Book.find({});
    }

    res.render('index', { user: req.user, books, searchQuery });
  } catch (err) {
    console.error('Помилка отримання книг:', err.message);
    res.status(500).send('Серверна помилка');
  }
});



module.exports = router;