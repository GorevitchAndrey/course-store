const { Router } = require('express');
const { validationResult } = require('express-validator');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
})

router.post('/', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { title, price, img } = req.body;
  const userId = req.user;
  const course = new Course({ title, price, img, userId });

  if(!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Add course',
      isAdd: true,
      error: errors.array()[0].msg,
      data: { title, price, img }
    })
  }

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router;
