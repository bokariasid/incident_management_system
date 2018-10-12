var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');

var oauth2 = require('./auth/oauth2');

var api = require('./routes/api');
var users = require('./routes/users');
var tickets = require('./routes/ticket');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/', api);
app.use('/api', api);
app.use('/api/users', users);
app.use('/api/tickets', passport.authenticate('bearer', { session: false }), tickets);
app.use('/api/oauth/token', oauth2.token);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({
    	error: 'Not found'
    });
    return;
});

// error handlers
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({
    	error: err.message
    });
    return;
});

module.exports = app;