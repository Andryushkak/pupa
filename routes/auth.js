const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('../models/DataBace'); // твоя функція пошуку користувача

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    req.flash('error', 'Користувача з такою поштою не існує');
    return res.redirect('/login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash('error', 'Невірний пароль');
    return res.redirect('/login');
  }

  // Якщо все добре
  req.session.userId = user._id;
  res.redirect('/');
});

module.exports = router;
