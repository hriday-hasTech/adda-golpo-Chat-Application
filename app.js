const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const passport = require('passport');

// only require part
require('dotenv').config();
require('./passport/passport');

// import routes
const authRoute = require('./routes/authRoute');
const oAuthRouter = require('./routes/oAuthRouter');
const successMsgRoute = require('./routes/successMsgRoute');

// app
const app = express();
app.set('view engine', 'ejs');

// middleware
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    useTempFiles: true
  })
);

const store = new MongoDBStore({
  uri: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@blog-site-lxobl.mongodb.net/project_name`,
  collection: 'mySessions'
});

store.on('error', function(error) {
  console.log(error);
});

// session config middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    store
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// custom middleware
app.use((req, res, next) => {
  res.locals.title = 'Welcome to Adda Golpo';
  res.locals.isAuth = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// routes

// home page
app.get('/', (req, res) => res.render('homePage'));

// auth router
app.use(authRoute);
// oAuth router
app.use('/oauth', oAuthRouter);

// success message router
app.use(successMsgRoute);

// error handling middleware
app.use((err, req, res, next) => {
  console.log('server error', err);
  res.render('error/500');
});

// 404 middleware
app.use((req, res) => {
  res.render('error/404');
});

// database connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@blog-site-lxobl.mongodb.net/project_name`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        '\x1b[33m%s\x1b[0m',
        `App is running on port ${process.env.PORT}`
      );
    });
  })
  .catch(err => {
    console.log(err);
  });
