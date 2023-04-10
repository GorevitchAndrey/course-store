const { Router } = require('express');
const Order = require('../models/order');
const router = Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id}).populate(['user.userId'])


    res.render('orders', {
      isOrder: true,
      title: 'Orders',
      orders: orders.map(order => {
        return {
          ...order._doc,
          price: order.courses.reduce((total, data) => {
            return total += data.count * data.course.price
          }, 0)
        }
      })
    })
  } catch(error) {
    console.log('Error in orders (get): ', error);
  } 
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate(['cart.items.courseId']);

    const courses = user.cart.items.map(item => ({
      count: item.count,
      course: {...item.courseId._doc}
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses: courses
    })

    await order.save();
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (error) {
    console.log('Error in orders (post): ', error);
  }
  
})

module.exports = router;