// --- CampReviewer (Node 22 + Mongoose 8 ready) ---

// Load environment variables first
require('dotenv').config();

// Core deps
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// Auth/session deps
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Models
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');

// Routes
const commentsRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

// Utilities
const methodOverride = require('method-override');
const flash = require('connect-flash');

// --- Express basics ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3003); // <-- use 3002 for campreviewer

app.use(express.urlencoded({ extended: true })); // replaces bodyParser
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// --- Mongo connection ---
const MONGO_URI =
  process.env.YELPCAMPDATABASEURL;

if (!MONGO_URI) {
  throw new Error('Failure to connect to MongoDB database');
}

async function connectDB() {
  await mongoose.connect(MONGO_URI); // Mongoose 8: simple connect
  console.log('✅ Mongo connected (CampReviewer)');
}

// --- Session store ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'IrnBru32Phenomenal',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // leave false if TLS ends at Cloudflare/NGINX
    },
  })
);

// --- Passport setup ---
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Template globals ---
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.confirm = req.flash('confirm');
  next();
});

// --- Routes ---
app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentsRoutes);

// --- Boot ---
connectDB()
  .then(() => {
    app.listen(app.get('port'), function () {
      console.log(`🚀 CampReviewer listening on ${app.get('port')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });

