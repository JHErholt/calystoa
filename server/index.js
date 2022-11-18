const path = require('path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
const cookieparser = require('cookie-parser');

const mongoose = require('mongoose');
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }); // Connect to MongoDB
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

if (process.env.ENVIREMENT === "development") { // If in development mode use livereload
  const reload = livereload.createServer();
  reload.watch(__dirname + "/server.js");
}

const PORT = process.env.PORT || 3001;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, "../client/src")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieparser());

// Steam api
passport.serializeUser((user, done) => { // Serialize user into seesion
  done(null, user);
});
passport.deserializeUser((user, done) => { // Deserialize user out of session
  done(null, user);
});

passport.use(new SteamStrategy({
  returnURL: 'https://svendeproeve-jerholt.herokuapp.com/api/auth/steam/return',
  realm: 'https://svendeproeve-jerholt.herokuapp.com/',
  apiKey: process.env.STEAM_API_KEY
}, function (identifier, profile, done) {
  process.nextTick(function () {
    profile.identifier = identifier;
    return done(null, profile);
  });
}
));
app.use(session({
  secret: 'Pizza with extra cheese',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 3600000
  }
}))
app.use(passport.initialize());
app.use(passport.session());
app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
  res.redirect('/')
});
app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
  res.redirect(`/user/${req.user._json.steamid}/`);
});




// Routes
app.use('/article', require('./routes/article'));
app.use('/user', require('./routes/user'));

const User = require('./models/user');

app.get('/', async (req, res) => {
  if (!req.user) {
    return res.render(path.resolve(__dirname, "../client/views/index.ejs"), { user: undefined });
  }

  const user = await User.findOne({ steam_id: req.user.id });
  if (user) {
    return res.render(path.resolve(__dirname, "../client/views/index.ejs"), { user: req.user });
  }

  try {
    const newUser = new User({
      steam_id: req.user.id,
      username: req.user.displayName,
      photos: {
        small: req.user.photos[1].value,
        large: req.user.photos[2].value
      }
    });
    await newUser.save();
    res.render(path.resolve(__dirname, "../client/views/index.ejs"), { user: req.user });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/logout', (req, res) => {
  req.session.cookie.maxAge = new Date(null).getTime();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log('Listening, port ' + PORT);
});
