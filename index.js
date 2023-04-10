const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const handlebar = require('express-handlebars');
const Handlebars = require('handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const routeHome = require('./routes/home');
const cartRoutes = require('./routes/cart')
const routeAdd = require('./routes/add');
const routeCourses = require('./routes/courses');
const routeOrders = require('./routes/orders');
const routeAuth = require('./routes/auth');
const variableMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const PORT = process.env.PORT || 3001;
const app = express();
const MONGODB_URI = 'mongodb+srv://dochorevych:4dc8pgzn8rifn5@node-with-mongodb.yneou6k.mongodb.net/shop'

const hbs = handlebar.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
})

const store = new MongoStore({
  collection: 'sessions',
  uri: MONGODB_URI
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'secret value',
  resave: false,
  saveUninitialized: false,
  store: store
}))
// generating a unique key for the client
app.use(csrf());
app.use(flash());
app.use(variableMiddleware);
app.use(userMiddleware);

// routes
app.use('/', routeHome);
app.use('/add', routeAdd);
app.use('/courses', routeCourses);
app.use('/cart', cartRoutes);
app.use('/orders', routeOrders);
app.use('/auth', routeAuth);

mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log("MongoDB Connected")
    )
    app.listen(PORT, () => {
      console.log(`Server started in port ${PORT}`);
    })
  } catch (error) {
    console.error('Error in index file', error);
  }
}

connectDatabase()
