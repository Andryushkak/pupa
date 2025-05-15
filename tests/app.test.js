const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { User } = require('../bace/DataBace');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI); // або MONGO_URI_TEST
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Реєстрація та логін', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'test1234'
  };

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  // ---- Реєстрація ----
  test('Реєстрація нового користувача', async () => {
    const res = await request(app)
      .post('/register')
      .send(testUser);

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('Реєстрація з існуючим email повертає помилку', async () => {
    const res = await request(app)
      .post('/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Користувач вже існує/);
  });

  test('Реєстрація з некоректним email', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...testUser, email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Некоректний email/i);
  });

  test('Реєстрація без обов’язкових полів повертає помилку', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: '', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Всі поля обов'язкові/);
  });

  test('Реєстрація з паролем коротшим за 6 символів', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...testUser, password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Пароль занадто короткий/);
  });

  // ---- Логін ----
  test('Логін користувача з правильними даними', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/profile');
  });

  test('Логін з неправильним паролем повертає на логін', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: 'wrongpass' });

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('Логін з неіснуючим email повертає на логін', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'noexist@example.com', password: 'test1234' });

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('Логін з порожнім паролем повертає на логін', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: '' });

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  // ---- Захищені маршрути ----
  test('Доступ до профілю для авторизованого користувача', async () => {
    const agent = request.agent(app);

    // Логін
    await agent
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    // Запит до профілю
    const res = await agent.get('/profile');

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/profile/);
  });

  test('Доступ до профілю для неавторизованого користувача - редірект на логін', async () => {
    const res = await request(app).get('/profile');

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  // ---- Вихід з системи ----
  test('Вихід з системи', async () => {
    const agent = request.agent(app);

    // Логін
    await agent
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    // Вихід
    const res = await agent.get('/logout');

    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('/');
  });
});
