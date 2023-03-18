const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const handlebar = require('express-handlebars');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const routeHome = require('./routes/home');
const cartRoutes = require('./routes/cart')
const routeAdd = require('./routes/add');
const routeCourses = require('./routes/courses');
const routeOrders = require('./routes/orders');
const PORT = process.env.PORT || 3001;
const app = express();
const User = require('./models/user')

const hbs = handlebar.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use( async (req, res, next) => {
  try {
    const user = await User.findById('63fcf75100b8026295f51c67');
    req.user = user;
    next()
  } catch(error) {
    console.log(error);
  }
})
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))

app.use('/', routeHome);
app.use('/add', routeAdd);
app.use('/courses', routeCourses);
app.use('/cart', cartRoutes);
app.use('/orders', routeOrders);


mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  try {
    const url = 'mongodb+srv://dochorevych:4dc8pgzn8rifn5@node-with-mongodb.yneou6k.mongodb.net/shop'
    await mongoose.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log("MongoDB Connected")
    )

    const candidate = await User.findOne();
    if(!candidate) {
      const user = new User({
        email: 'andrey@mail.com',
        name: 'Andrey',
        cart: {items: []}
      })
      await user.save()
    }
    app.listen(PORT, () => {
      console.log(`Server started in port ${PORT}`);
    })
  } catch (error) {
    console.error('Error in index file', error);
  }
}

connectDatabase()
