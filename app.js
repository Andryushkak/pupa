require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const database = require('./bace/DataBace');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');

const initializePassport = require('./config/passport-config');
initializePassport(passport);

const indexRoutes = require('./routes/index');
const booksRoutes = require('./routes/books');
const profileRoutes = require('./routes/profile');

const app = express();

// Налаштування view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));

// Парсери
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // додано для парсингу JSON

// Сесії та Passport
app.use(session({
  secret: '3d5879beae87657b4c944f7ee4da4886adc8cd5cb0c73b5675ce66d2773b3396',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Flash-повідомлення
app.use(flash());

// Поточний користувач для всіх шаблонів
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Маршрути
app.use('/', indexRoutes);
app.use('/', booksRoutes);
app.use('/', profileRoutes);

// Роут /home
app.get('/home', (req, res) => {
  res.render('index', { user: req.user });
});

// Реєстрація
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Всі поля обов'язкові");
  }

  // Простенька валідація email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Некоректний email');
  }

  if (password.length < 6) {
    return res.status(400).send('Пароль занадто короткий');
  }

  try {
    const result = await database.registerUser(firstName, lastName, email, password);
    if (result) {
      try {
        await sendWelcomeEmail(email, firstName);
      } catch (emailErr) {
        console.warn("Лист не відправлено:", emailErr.message);
      }
      return res.redirect('/login');
    } else {
      return res.status(400).send('Користувач вже існує');
    }
  } catch (err) {
    console.error("Помилка при реєстрації:", err.message);
    return res.status(500).send('Помилка реєстрації користувача');
  }
});

// Логін
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

// Профіль
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user });
  } else {
    res.redirect('/login');
  }
});

// Вихід
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Надсилання email
async function sendWelcomeEmail(toEmail, firstName) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Pupa App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Ласкаво просимо!',
    html: `<h2>Привіт, ${firstName}!</h2>
           <p>Дякуємо за реєстрацію в нашому застосунку. Успіхів!</p>`
  };

  await transporter.sendMail(mailOptions);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

module.exports = app;
