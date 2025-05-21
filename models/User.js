const mongoose = require('mongoose');

// Схема користувача
const userSchema = new mongoose.Schema({
  firstName: String, // Ім’я
  lastName: String,  // Прізвище
  email: { 
    type: String, 
    required: true, 
    unique: true  // Кожен email має бути унікальним
  },
  password: String   // Пароль (зазвичай зберігається в зашифрованому вигляді)
});

// Експортуємо модель User
module.exports = mongoose.model('Users', userSchema);
