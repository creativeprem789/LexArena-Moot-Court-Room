const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/auth.routes');
const courtroomRoutes = require('./routes/courtroom.routes');

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  })
);

// Initialize Passport
require('./config/passport');
app.use(passport.initialize());

// Mount routers
app.use('/auth', authRoutes);
app.use('/api/courtroom', courtroomRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
