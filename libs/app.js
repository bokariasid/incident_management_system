var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');
const log = console;
let oauth2 = require('./auth/oauth2');
let oauth2_resolver = require('./auth/resolver_oauth2');

var api = require('./routes/api');
var users = require('./routes/users');
var tickets = require('./routes/ticket');
var resolvers = require('./routes/resolver');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/', api);
app.use('/api', api);
app.use('/api/users', users);
// tickets route for users.
app.use('/api/tickets', passport.authenticate('bearer', { session: false }), tickets);
// authentication route for users.
app.use('/api/user/oauth/token', oauth2.token);
// authentication route for resolvers.
app.use('/api/resolver/oauth/token', oauth2_resolver.resolver_token);
// tickets route for resolvers
app.use('/api/resolver', passport.authenticate('bearer', { session: false }), resolvers);

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
// schedule tasks to be run on the server
cron.schedule("* * * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job");
    // fs.unlink("./error.log", err => {
    //     if (err) throw err;
    //     console.log("Error file succesfully deleted");
    // });
});
module.exports = app;