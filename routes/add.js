const { Router } = require('express');
const Course = require('../models/course');
const router = Router();

router.get('/', (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
})

router.post('/', async (req, res) => {
  const { title, price, img } = req.body;
  const userId = req.user;

  const course = new Course({ title, price, img, userId });

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router;
