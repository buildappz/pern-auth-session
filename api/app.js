/**
 * Main application file
 * Configures and initializes Express application with all middleware and routes
 */

// -------------------------------
// Environment & Module Imports
// -------------------------------
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// -------------------------------
// Configuration Imports
// -------------------------------
const sessionConfig = require('./config/session');
const sequelize = require('./config/database');

// -------------------------------
// Route Imports
// -------------------------------
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

// -------------------------------
// Express Instance
// -------------------------------
const app = express();

// -------------------------------
// Database Initialization
// -------------------------------
sequelize.sync()
  .then(() => {
    console.log('✅ Database synchronized successfully');
  })
  .catch(err => {
    console.error('❌ Database synchronization error:', err);
    process.exit(1); // Exit if database connection fails
  });

// -------------------------------
// View Engine Configuration
// -------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// -------------------------------
// Global Middleware Setup
// -------------------------------
// Request logging
app.use(logger('dev'));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Session handling
app.use(session(sessionConfig));

// -------------------------------
// Route Registration
// -------------------------------
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// -------------------------------
// Error Handling
// -------------------------------
// 404 Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Set locals for error page
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // Log errors in development
  if (req.app.get('env') === 'development') {
    console.error('❌ Error:', err);
  }

  // Send error response
  res.status(err.status || 500);
  res.render('error');
});

// -------------------------------
// Export Application
// -------------------------------
module.exports = app;