const {Router} = require('express')
const Course = require('../models/course')
const router = Router()

router.get('/', async (req, res) => {
  const courses = await Course.getAll()
  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    courses
  })
})

router.get('/:id/edit', async (req, res) => {
  const course = await Course.getById(req.params.id);
  if (!req.query.allow) return res.redirect('/')

  res.render('course-edit', {
    title: `Edit course ${course.title}`,
    course
  })
})

router.post('/edit', async (req, res) => {
  await Course.update(req.body);
  res.redirect('/courses')
})

router.get('/:id', async (req, res) => {
  const course = await Course.getById(req.params.id);
  res.render('course', {
    layout: 'empty',
    title: `Course ${course.title}`,
    course
  })
})

module.exports = router