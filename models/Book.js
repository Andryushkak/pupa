const mongoose = require('mongoose');

// Схема відгуку
const reviewSchema = new mongoose.Schema({
  content: { type: String, required: true }, // Текст відгуку
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Автор відгуку
  createdAt: { type: Date, default: Date.now } // Дата створення
});

// Основна схема книги
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  year: Number,
  genre: String,
  coverImage: String, // Шлях до зображення обкладинки
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Користувач, який додав книгу
  createdAt: { type: Date, default: Date.now },
  reviews: [reviewSchema] // ⬅ Масив відгуків
});

module.exports = mongoose.model('Book', bookSchema);
