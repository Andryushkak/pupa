// books.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bookStorage } = require('../config/cloudinary');
const upload = multer({ storage: bookStorage });
const Book = require('../models/Book');
const { isLoggedIn } = require('../middleware/auth');

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
    // Популяція відгуків з інформацією про користувача (для виведення його імені)
    const book = await Book.findById(bookId).populate('reviews.user');
    if (!book) {
      return res.status(404).send('Книгу не знайдено');
    }
    res.render('book', { book });
  } catch (err) {
    console.error('Помилка при отриманні книги:', err.message);
    res.status(500).send('Помилка серверу');
  }
});

// POST додавання відгуку до книги
router.post('/books/:id/reviews', isLoggedIn, async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log('Отримано ID книги:', bookId); // Логування ID книги для перевірки

    // Знайдемо книгу по ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Книгу не знайдено');
    }

    // Створення нового відгуку
    const review = {
      content: req.body.content,
      user: req.user._id,
      createdAt: new Date()
    };

    // Додавання відгуку до масиву відгуків книги
    book.reviews.push(review);
    await book.save();

    // Переадресація назад на сторінку книги з новим відгуком
    res.redirect(`/books/${book._id}`);
  } catch (err) {
    console.error('Помилка додавання відгуку:', err.message);
    res.status(500).send('Помилка серверу');
  }
});

module.exports = router;
