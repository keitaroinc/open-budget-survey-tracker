var fs = require('fs');
var path = require('path');
var express = require('express');
var swig = require('swig');
var logger = require('morgan');
var bodyParser = require('body-parser');
var _ = require('underscore');
// var i18n = require('i18n-abide');

// var locales = _.without(fs.readdirSync(path.join(__dirname, '/i18n')), 'messages.pot');
var routes = require('./routes/index');
var manifest = require('./public/build/manifest.json');

var app = express();

// view engine setup
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

// OK setup translation
// app.use(i18n.abide({
//   default_lang: 'en',
//   supported_languages: locales,
//   translation_directory: 'i18n'
// }));
app.use(function (req, res, next) {
  res.locals.gettext = function (text) {
    return text;
  };
  res.locals.asset = function (file) {
    if (app.get('env') === 'development') {
      return file;
    }
    var index = file.substr(file.lastIndexOf('/')+1);
    if (typeof manifest[index] === 'string') {
      file = '/build'+file.replace(index, manifest[index]);
    }
    return file;
  };
  next();
});

// Now routes...
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      status: err.status,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    status: err.status,
    message: err.message,
    error: {}
  });
});

module.exports = app;
