'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const users = require('./routes/users');
const courses = require('./routes/courses');
const {sequelize} = require('./models/index');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup morgan which gives us http request logging
app.use(morgan('dev'));

(async() => {
  try {
    await sequelize.authenticate();
    //syncing the database
    await sequelize.sync();
    console.log('connection has been established sucessfully!');

  } catch (error) {
    console.log('unable to connect to the database:', error);
  }

})();

// TODO setup your api routes here
app.use('/api', users);
app.use('/api', courses);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
