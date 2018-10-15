var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
const cron = require('node-cron');
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

// it can be made smarter by consuming config values, depending upon the load of the application.
var ticketAssigner = () => {
    var db = require(libs + 'db/mongoose');
    var asyncLib = require('async');
    var Ticket = require(libs + 'model/ticket');
    var moment = require('moment');
    var Resolvers = require(libs + 'model/resolver');
    console.log("---------------------");
    console.log("Assigning tickets to a random resolver");
    var randomResolver = (callback) => {
        // console.log('in random resolver')
        // Get the count of all RESOLVERS
        Resolvers.countDocuments((err, count) => {
            if(err){
                throw err;
            }
            // Get a random entry
            var random = Math.floor(Math.random() * count)
            Resolvers.findOne().skip(random).exec((err, result) => {
                if(err){
                    console.log(err);
                    callback(err);
                }
                // Tada! random RESOLVER
                callback(null, result);
            })
        })
    };
    Ticket.find({resolver_id:{$exists:false}}, (err, tickets) => {
        if(err){
            throw err;
        } else {
            asyncLib.each(tickets, (ticket, cbEach) => {
                // console.log(ticket);
                randomResolver((err, resolver) => {
                    if(err){
                        cbEach(err);
                    } else {
                        let dateString = moment().format('YYYY-MM-DD HH:m:ss');
                        ticket.resolver_id = resolver.id;
                        let remark = {
                            resolver_id:resolver.id,
                            remark:'Ticket assigned on '+dateString
                        };
                        ticket.status = 2;
                        ticket.remark = [remark];
                        ticket.save((err) => {
                            if(err){
                                console.log(err);
                                cbEach(err);
                            } else {
                                console.log('ticket with id : %s assigned to %s', ticket.id, resolver.id);
                                cbEach();
                            }
                        });
                    }
                });
            }, (err) => {
                if(err){
                    throw err;
                }
            });
        }
    });
};

// we can use config values to implement a better auto escalation scenario.
var autoEscalator = () => {
    console.log("---------------------");
    console.log("Escalating tickets to a random resolvers");
    var db = require(libs + 'db/mongoose');
    var asyncLib = require('async');
    var Ticket = require(libs + 'model/ticket');
    var moment = require('moment');
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate()-2);
    var escalationQuery = {
        status:2,
        date : {$lt:cutoff}
    };
    // hierarchy for resolvers can be implemented for escalating the authority of the resolver.
    var randomResolver = (callback) => {
        // console.log('in random resolver')
        // Get the count of all RESOLVERS
        Resolvers.countDocuments((err, count) => {
            if(err){
                throw err;
            }
            // Get a random entry
            var random = Math.floor(Math.random() * count)
            Resolvers.findOne().skip(random).exec((err, result) => {
                if(err){
                    console.log(err);
                    callback(err);
                }
                // Tada! random RESOLVER
                callback(null, result);
            })
        })
    };
    Ticket.find(escalationQuery, (err, tickets) => {
        if(err){
            throw err;
        } else {
            asyncLib.each(tickets, (ticket, cbEach) => {
                randomResolver((err, resolver) => {
                    if(err){
                        cbEach(err);
                    } else {
                        ticket.status = 0;
                        let dateString = moment().format('YYYY-MM-DD HH:m:ss');
                        ticket.remark.push({
                            resolver_id:resolver.id,
                            remark:"Ticket escalated on "+dateString
                        })
                        ticket.save((err) => {
                            if(err){
                                cbEach(err);
                            } else {
                                console.log('ticket with id : %s escalated to %s', ticket.id, resolver.id);
                            }
                        });
                    }
                });
            }, (err) => {
                if(err){
                    throw err;
                }
            });
        }
    })
}
// schedule tasks to be run on the server
cron.schedule("* * * * *", ticketAssigner);
cron.schedule("0 * * * *", autoEscalator);
// cron.schedule("* * * * *", ticketAssignerCron.assigner);
module.exports = app;