const express = require('express');
const passport = require('passport');

const router = express.Router();

//description === google authentication
//route === GET /auth/google

router.get('/google', passport.authenticate('google', {scope: ['profile']}));

//description === google authentication callback
//route === GET/auth/google/callback

router.get('/google/callback',
 passport.authenticate('google',{failureRedirect: '/'}),
 (req,res) => {
    res.redirect('/dashboard')
}
);

router.get('/logout', (req,res,next) => {
    req.logout((error) => {
        if(error) {return next(error)}
        res.redirect('/')
    });
    res.redirect('/')
})

module.exports = router;