const express = require('express');
const router = express.Router();
const database = require('../bace/DataBace');

// Показати форму редагування профілю
router.get('/profile/edit', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('edit-profile', { user: req.user });
});

// Обробити редагування
router.post('/profile/edit', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  const { firstName, lastName, email, photo } = req.body;
  try {
    const user = await database.findUserById(req.user._id);
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    if (photo) user.photo = photo;
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error('Помилка оновлення профілю:', err.message);
    res.status(500).send('Помилка сервера');
  }
});

module.exports = router;
