require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB User model
const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  photo: String
});
const User = mongoose.model('User', userSchema);

// Passport Google OAuth config
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value
    });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Issue JWT and send to frontend
  const user = req.user;
  const token = jwt.sign({ id: user._id, displayName: user.displayName, email: user.email, photo: user.photo }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // For dev: redirect with token in query (in prod, use httpOnly cookie)
  res.redirect(`http://localhost:5173/auth-success?token=${token}`);
});

// Endpoint to get user info from JWT
authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get('/api/me', authenticateJWT, (req, res) => {
  res.json(req.user);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
}); 