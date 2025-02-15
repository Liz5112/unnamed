const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = 8888;
const app = express();
const authController = require('./controllers/authController.js');
const sessionController = require('./controllers/sessionController.js');
const cookieController = require('./controllers/cookieController.js');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// serve all static files if there is a session
app.use(
  '/home',
  sessionController.hasSession,
  express.static(path.resolve(__dirname, '../build'))
);

// render login page as our root directory
app.get('/', (req, res) => {
  console.log("at get '/' route");
  res.render('login', { error: null });
});
app.post(
  '/',
  authController.verifyUser,
  sessionController.startSession,
  cookieController.setSSIDCookie,
  (req, res) => {
    return res.redirect('/home');
  }
);

app.get('/signup', (req, res) => res.render('signup', { error: null }));

app.post(
  '/signup',
  authController.createUser,
  sessionController.startSession,
  cookieController.setSSIDCookie,
  (req, res) => {
    console.log('at POST /signup');
    return res.redirect('/home');
  }
);

app.use((req, res) => res.sendStatus(404));

// global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 404,
    message: { error: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});

module.exports = app;
