const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const database = require('../bace/DataBace');

// Головна сторінка з пошуком, фільтром по жанрах (мультивибір) і сортуванням
router.get('/', async (req, res) => {
  const searchQuery = req.query.q || '';
  let selectedGenres = req.query.genre || [];
  const sortOrder = req.query.sort || 'asc'; // 'asc' або 'desc'

  // Забезпечуємо, що selectedGenres — масив (якщо прийшов один жанр — обгортаємо в масив)
  if (!Array.isArray(selectedGenres)) {
    selectedGenres = selectedGenres ? [selectedGenres] : [];
  }

  const filter = {};

  if (searchQuery) {
    const regex = new RegExp(searchQuery, 'i');
    filter.$or = [{ title: regex }, { author: regex }];
  }

  if (selectedGenres.length > 0) {
    filter.genre = { $in: selectedGenres };
  }

  try {
    const sortCriteria = { title: sortOrder === 'desc' ? -1 : 1 };

    const books = await Book.find(filter).sort(sortCriteria);
    const genres = await Book.distinct('genre');

    res.render('index', {
      user: req.user,
      books,
      searchQuery,
      genres,
      selectedGenres,
      sortOrder,
    });
  } catch (err) {
    console.error('Помилка завантаження книг:', err.message);
    res.render('index', {
      user: req.user,
      books: [],
      searchQuery,
      genres: [],
      selectedGenres: [],
      sortOrder: 'asc',
    });
  }
});

module.exports = router;
