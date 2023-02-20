const express = require('express');
const path = require('path');
const handlebar = require('express-handlebars');
const routeHome = require('./routes/home');
const cardRoutes = require('./routes/card')
const routeAdd = require('./routes/add');
const routeCourses = require('./routes/courses');

const PORT = process.env.PORT || 3001;
const app = express();

const hbs = handlebar.create({
  defaultLayout: 'main',
  extname: 'hbs'
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))

app.use('/', routeHome);
app.use('/add', routeAdd);
app.use('/courses', routeCourses);
app.use('/card', cardRoutes)


app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
})