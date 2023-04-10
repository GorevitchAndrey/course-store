const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function mapCartItems(cart) {
  return cart.items.map(course => ({
    ...course.courseId._doc,
    count: course.count,
    id: course.courseId.id
  }))
}

function computePrice(data) {
  return data.reduce((total, course) => {
    return total += course.price * course.count;
  }, 0)
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id)
  await req.user.addToCart(course)
  res.redirect('/cart')
})

router.get('/', auth, async (req, res) => {
  const user = await req.user
  .populate(['cart.items.courseId'])

  const courses = mapCartItems(user.cart);

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses: courses,
    price: computePrice(courses)
  })
})

router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate(['cart.items.courseId']);
  const courses = mapCartItems(user.cart) 
  const cart = {
    courses, price: computePrice(courses)
  }

  res.status(200).json(cart);
})

module.exports = router;