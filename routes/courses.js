const {Router} = require('express');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function isOwner(course, request) {
  return course.userId.toString() === request.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
    .populate('userId', 'email name')
    .select('price title img')

    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      userId: req.user ? req.user._id : null,
      courses
    })
  } catch(error) {
    console.log('Error: ', error);
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  try {
    const data = await Course.findById(req.params.id)

    if(!isOwner(data, req)) {
      return res.redirect('/courses');
    }

    res.render('course-edit', {
      title: `Edit ${data.title}`,
      data
    })

  } catch(error) {
    console.log('Error in :id/edit: ', error);
  }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { title, price, img, id } = req.body;

  if(!errors.isEmpty()) {
    const currentCourse = await Course.findById(req.body.id);

    return res.status(422).render('course-edit', {
      title: `Edit ${currentCourse.title}`,
      isAdd: true,
      error: errors.array()[0].msg,
      data: { title, price, img, id }
    })
  }

  try {
    delete req.body.id;
    const data = await Course.findById(id);

    if(!isOwner(data, req)) {
      return res.redirect('/courses');
    }

    Object.assign(data, req.body);
    await data.save();
    res.redirect('/courses');
  } catch(error) {
    console.log('Error in edit: ', error);
  }
})


router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Course ${course.title}`,
      course
    })
  } catch(error) {
    console.log('Error: ', error);
  }
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    })
    res.redirect('/courses')
  } catch (error) {
    console.error('Error in remove', error)
  }
})

module.exports = router