const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const { registerValidators, loginValidators } = require('../utils/validators');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
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

router.post('/login', loginValidators, async (req, res) => {
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

router.post('/register', registerValidators, async (req, res) => {
  try{
    const { email, name, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    // encrypt the password
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email, name, password: hashPassword, cart: { items: [] }
    })

    await user.save();
    await transporter.sendMail(regEmail(email), (error, info) => {
      if (error) {
        console.log('Error in registration, email not sent: ',error);
      } else {
        res.redirect('/auth/login#login');
        console.log('Email sent: ' + JSON.stringify(info));
      }}
    )
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
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token), (error, info) => {
          if (error) {
            console.log('Error in reset, email not reset: ',error);
          } else {
            console.log('Email reset: ' + JSON.stringify(info));
          }}
        )
        res.redirect('/auth/login');
      } else {
        req.flash('error', 'There is no such email')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log("Error: ",e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login');
    } else {
      res.render('auth/password', {
        title: 'Restore access',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch(error) {
    console.log('Error: ', error);
  }
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login');
    } else {
      req.flash('loginError', 'Life cycle token ended');
      res.redirect('/auth/login');
    }
  } catch (e) {
    console.log("Error: ",e)
  }
})
module.exports = router;
