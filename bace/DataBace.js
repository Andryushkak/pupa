const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Підключення до MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Схема користувача
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    photo: {
        type: String,
        default: '/image/default-profile.png'
    },
    books: [
        {
            title: String,
            author: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    reviews: [
        {
            bookTitle: String,
            text: String,
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

// Хешування пароля перед збереженням
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Метод для перевірки пароля при вході
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Модель користувача
const User = mongoose.model('User', userSchema);

// Допоміжні функції
async function registerUser(firstName, lastName, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) return false;

    const user = new User({ firstName, lastName, email, password });
    await user.save();
    return true;
}

async function findUserByEmail(email) {
    return User.findOne({ email });
}

async function findUserById(id) {
    return User.findById(id);
}

// Експорт
module.exports = {
    registerUser,
    findUserByEmail,
    findUserById,
    User
};
