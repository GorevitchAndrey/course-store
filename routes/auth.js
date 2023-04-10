const { Router } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = Router();

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Authorization',
    isLogin: true,
    registerError: req.flash('registerError'),
    loginError: req.flash('loginError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      // checking password
      const isCurrentUser = await bcrypt.compare(password, candidate.password);

      if(isCurrentUser) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;

        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/');
        })
      } else {
        req.flash('loginError', 'Incorrect password');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'User undefined');
      res.redirect('/auth/login#login');
    }
  } catch(err) {
    console.log('Error login: ', err);
  }
})

router.post('/register', async (req, res) => {
  try{
    const { email, name, password, repeat } = req.body;
    const candidate = await User.findOne({ email });
    if(candidate) {
      req.flash('registerError', 'Current email already registered');
      res.redirect('/auth/login#register')
    } else {
      // encrypt the password
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email, name, password: hashPassword, cart: { items: [] }
      })
      await user.save();
      res.redirect('/auth/login#login')
    }
  } catch(err) {
    console.log('Error in registration: ', err);
  }
})

module.exports = router;
