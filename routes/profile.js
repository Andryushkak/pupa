const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const database = require('../bace/DataBace');

// GET форма
router.get('/profile/edit', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('edit-profile', { user: req.user });
});

// POST з фото
router.post('/profile/edit', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Помилка multer/cloudinary:', err);
      return res.status(500).send(`Помилка завантаження фото: ${err.message}`);
    }

    const { firstName, lastName, email } = req.body;

    try {
      const user = await database.findUserById(req.user._id);

      if (!user) {
        return res.status(404).send('Користувача не знайдено');
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;

      if (req.file) {
        user.photo = req.file.path;
      }

      await user.save();
      res.redirect('/profile');
    } catch (err) {
      console.error('Помилка оновлення профілю:', err);
      res.status(500).send(`Помилка сервера: ${err.message}`);
    }
  });
});

module.exports = router;