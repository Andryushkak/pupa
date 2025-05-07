

const express = require('express');
const router = express.Router();
const { findUserById, updateUser } = require('../bace/DataBace');


router.get('/profile', async function(req, res) {
    try {
        const user = await findUserById(req.user.id);
        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/profile/edit', async function(req, res) {
    try {
        const user = await findUserById(req.user.id); 
        res.render('profile-edit', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/profile/update', async function(req, res) {
    try {
        const { firstName, lastName, email } = req.body;
        await updateUser(req.user.id, firstName, lastName, email);
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
