require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');


const database = require('./bace/DataBace');
const initializePassport = require('./config/passport-config');
initializePassport(passport);


const indexRoutes = require('./routes/index');
const profileRoutes = require('./routes/profile');
const booksRoutes = require('./routes/books');

const app = express();


app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', profileRoutes);
app.use('/', booksRoutes);
app.use('/', indexRoutes);

app.get('/home', (req, res) => {
    res.render('index', { user: req.user });
});


app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
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


app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));


app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user });
  } else {
    res.redirect('/login');
  }
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});


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
    html: `<h2>Привіт, ${firstName}!</h2><p>Дякуємо за реєстрацію в нашому застосунку. Успіхів!</p>`
  };

  await transporter.sendMail(mailOptions);
}

app.get('/', (req, res) => {
    res.render('morok');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

module.exports = app;
