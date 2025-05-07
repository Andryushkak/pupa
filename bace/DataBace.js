const { Sequelize } = require('sequelize');
const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();

const config = {
  user: "morok",
  password: "gensy[eqkj2022",
  server: "morok.database.windows.net",
  database: "morok",
  options: {
    encrypt: true
  }
};

async function pool() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to the database');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function registerUser(firstName, lastName, email, password) {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('User already exists');
      return false;
    }

    const dbPool = await pool();
    const request = dbPool.request();
    request.input("firstName", sql.NVarChar(50), firstName);
    request.input("lastName", sql.NVarChar(50), lastName);
    request.input("email", sql.NVarChar(200), email);
    request.input("password", sql.NVarChar(500), password);
    await request.query(`
      INSERT INTO [user] (first_name, last_name, email, password)
      VALUES (@firstName, @lastName, @email, @password);
    `);
    console.log('User successfully registered');
    return true;
  } catch (error) {
    console.error('User registration error:', error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("email", sql.NVarChar(200), email);
    request.input("password", sql.NVarChar(500), password);
    const result = await request.query(`
      SELECT * FROM [user] WHERE email = @email AND password = @password;
    `);
    if (result.recordset.length === 0) {
      console.log('User not found or incorrect password');
      return null;
    }
    const user = result.recordset[0];
    console.log('User successfully logged in');
    return user;
  } catch (error) {
    console.error('User login error:', error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("email", sql.NVarChar(200), email);
    const result = await request.query(`
      SELECT * FROM [user] WHERE email = @email;
    `);
    if (result.recordset.length === 0) {
      console.log('User not found');
      return null;
    }
    const user = result.recordset[0];
    return user;
  } catch (error) {
    console.error('Find user by email error:', error);
    throw error;
  }
}

async function registerGoogleUser(profile) {
  try {
    const { givenName, familyName, emails } = profile;
    const email = emails[0].value;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('Користувач вже існує');
      return false;
    }

    const dbPool = await pool();
    const request = dbPool.request();
    request.input("firstName", sql.NVarChar(50), givenName);
    request.input("lastName", sql.NVarChar(50), familyName);
    request.input("email", sql.NVarChar(200), email);
    await request.query(`
      INSERT INTO [user] (first_name, last_name, email)
      VALUES (@firstName, @lastName, @email);
    `);
    console.log('Google користувача успішно зареєстровано');
    return true;
  } catch (error) {
    console.error('Помилка реєстрації Google користувача:', error);
    throw error;
  }
}

async function findUserById(id) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("id", sql.Int, id);
    const result = await request.query(`
      SELECT * FROM [user] WHERE id = @id;
    `);
    if (result.recordset.length === 0) {
      console.log('User not found');
      return null;
    }
    const user = result.recordset[0];
    return user;
  } catch (error) {
    console.error('Find user by id error:', error);
    throw error;
  }
}

async function updateUser(id, firstName, lastName, email) {
  try {
    const dbPool = await pool();
    const request = dbPool.request();
    request.input("id", sql.Int, id);
    request.input("firstName", sql.NVarChar(50), firstName);
    request.input("lastName", sql.NVarChar(50), lastName);
    request.input("email", sql.NVarChar(200), email);
    await request.query(`
      UPDATE [user]
      SET first_name = @firstName, last_name = @lastName, email = @email
      WHERE id = @id;
    `);
    console.log('User successfully updated');
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
}



module.exports = {
  registerUser,
  loginUser,
  findUserByEmail,
  registerGoogleUser,
  findUserById,
  updateUser
};
