// --- CampReviewer (Node 22 + Mongoose 8 ready) ---

// Load environment variables first
try { require('dotenv').config(); } catch (_) {}

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
app.set('port', process.env.PORT || 3003);

app.use(express.urlencoded({ extended: true })); // replaces bodyParser
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// --- Mongo connection ---
const MONGO_URI = process.env.YELPCAMPDATABASEURL;
if (!MONGO_URI) {
  throw new Error('Failure to connect to MongoDB database');
}
async function connectDB() {
  await mongoose.connect(MONGO_URI);
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
passport.use(new LocalStrategy(User.authenticate()));   // from passport-local-mongoose
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

// ---- Time + date helpers (define ONCE) ----

// Friendly absolute blog-style timestamp: "9 Sep 2025 at 16:42" (UK time)
app.locals.blogDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${dateStr} at ${timeStr}`;
};

// Relative age like "3 days ago" (today if < 24h)
app.locals.daysAgo = (date) => {
  if (!date) return 'unknown';
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

// ISO string for <time datetime="">
app.locals.isoDate = (date) => (date ? new Date(date).toISOString() : '');
// ---- end helpers ----

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
