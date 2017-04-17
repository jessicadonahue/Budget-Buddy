var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var bootstrap = require('bootstrap');
var mongoose = require('mongoose');

var hbs = require('hbs');
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
hbs.registerHelper('json', function (content) {
    return JSON.stringify(content);
});

hbs.registerHelper('numFixed', function(num) {
  return num.toFixed(2);
});

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./db.js');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.use(session({ secret: 'keyboard cat', resave:false, saveUninitialized: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure passport middleware
//app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use account model for authentication
passport.use(new LocalStrategy(db.authenticate()));
passport.serializeUser(db.serializeUser());
passport.deserializeUser(db.deserializeUser());

app.use('/', index);


app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap 

/*
app.use('/js', express.static('/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static('/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static('/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap */


//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
