module.exports.isLoggedIn = function (req, res, next) {
  // Якщо користувач авторизований, переходимо до наступної функції (це може бути обробка запиту)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // Якщо користувач не авторизований, переходимо на сторінку логіну
  res.redirect('/login'); // змініть URL на вашій сторінці логіну
};
