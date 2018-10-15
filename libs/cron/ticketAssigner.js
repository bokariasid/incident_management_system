require('dotenv').config({path:'../../.env'});
var libs = process.cwd() + '/libs/';
var db = require('../db/mongoose');
var asyncLib = require('async');
var Ticket = require('../model/ticket');
var moment = require('moment');
var Resolvers = require('../model/resolver');

var randomResolver = async () => {
    return new Promise((resolve, reject) => {
        Resolvers.countDocuments((err, count) => {
            if(err){
                return reject(err);
            }
            var random = Math.floor(Math.random() * count);
            Resolvers.findOne().skip(random).exec((err, result) => {
                if(err){
                    console.log(err);
                    return reject(err);
                }
                return resolve(result);
            });
        });
    });
};

var ticketList = async () => {
    return new Promise((resolve, reject) => {
        Ticket.find({resolver_id:{$exists:false}}, (err, tickets) => {
            if(err){
                return reject(err);
            } else {
                return resolve(tickets);
            }
        });
    });
};

var ticketAssigner = async () => {
    console.log("---------------------");
    console.log("Assigning tickets to a random resolver");
    var ticketsList = await ticketList()
    for (var i = ticketsList.length - 1; i >= 0; i--) {
        let ticket = ticketsList[i];
        let resolver = await randomResolver();
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
                throw err;
            } else {
                console.log('ticket with id : %s assigned to %s', ticket.id, resolver.id);
            }
        });
    }
};
// it can be made smarter by consuming config values, depending upon the load of the application.
// var ticketAssigner = () => {
//     var db = require(libs + 'db/mongoose');
//     var asyncLib = require('async');
//     var Ticket = require(libs + 'model/ticket');
//     var moment = require('moment');
//     var Resolvers = require(libs + 'model/resolver');
//     console.log("---------------------");
//     console.log("Assigning tickets to a random resolver");
//     var randomResolver = (callback) => {
//         // console.log('in random resolver')
//         // Get the count of all RESOLVERS
//         Resolvers.countDocuments((err, count) => {
//             if(err){
//                 throw err;
//             }
//             // Get a random entry
//             var random = Math.floor(Math.random() * count)
//             Resolvers.findOne().skip(random).exec((err, result) => {
//                 if(err){
//                     console.log(err);
//                     callback(err);
//                 }
//                 // Tada! random RESOLVER
//                 callback(null, result);
//             })
//         })
//     };
//     Ticket.find({resolver_id:{$exists:false}}, (err, tickets) => {
//         if(err){
//             throw err;
//         } else {
//             asyncLib.each(tickets, (ticket, cbEach) => {
//                 // console.log(ticket);
//                 randomResolver((err, resolver) => {
//                     if(err){
//                         cbEach(err);
//                     } else {
//                         let dateString = moment().format('YYYY-MM-DD HH:m:ss');
//                         ticket.resolver_id = resolver.id;
//                         let remark = {
//                             resolver_id:resolver.id,
//                             remark:'Ticket assigned on '+dateString
//                         };
//                         ticket.status = 2;
//                         ticket.remark = [remark];
//                         ticket.save((err) => {
//                             if(err){
//                                 console.log(err);
//                                 cbEach(err);
//                             } else {
//                                 console.log('ticket with id : %s assigned to %s', ticket.id, resolver.id);
//                                 cbEach();
//                             }
//                         });
//                     }
//                 });
//             }, (err) => {
//                 if(err){
//                     throw err;
//                 }
//             });
//         }
//     });
// };
module.exports = ticketAssigner;