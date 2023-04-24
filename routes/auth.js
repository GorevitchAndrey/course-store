const { Router } = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}))

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
      await transporter.sendMail(regEmail(email));
      res.redirect('/auth/login#login');
    }
  } catch(err) {
    console.log('Error in registration: ', err);
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot password?',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong, please try again later')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const candidate = await User.findOne({email: req.body.email})

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
        await candidate.save()
        await transporter.sendMail(resetEmail(candidate.email, token))
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'There is no such email')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})
module.exports = router;
