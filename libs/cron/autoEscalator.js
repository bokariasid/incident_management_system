require('dotenv').config({path:'../../.env'});
var libs = process.cwd() + '/libs/';
var db = require('../db/mongoose');
var asyncLib = require('async');
var Ticket = require('../model/ticket');
var moment = require('moment');
var Resolvers = require('../model/resolver');

// hierarchy for resolvers can be implemented for escalating the authority of the resolver.
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
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate()-2);
        var escalationQuery = {
            status:2,
            date : {$lt:cutoff}
        };
        Ticket.find({resolver_id:{$exists:false}}, (err, tickets) => {
            if(err){
                return reject(err);
            } else {
                return resolve(tickets);
            }
        });
    });
};

var autoEscalator = async () => {
    console.log("---------------------");
    console.log("Escalating tickets to a random resolvers");
    var ticketsList = await ticketList();
    for (var i = ticketsList.length - 1; i >= 0; i--) {
        let ticket = ticketsList[i];
        let resolver = await randomResolver();
        let dateString = moment().format('YYYY-MM-DD HH:m:ss');
        ticket.status = 0;
        ticket.remark.push({
            resolver_id:resolver.id,
            remark:"Ticket escalated on "+dateString
        })
        ticket.save((err) => {
            if(err){
                throw err;
            } else {
                console.log('ticket with id : %s escalated to %s', ticket.id, resolver.id);
            }
        });
    }
};
// we can use config values to implement a better auto escalation scenario.
// var autoEscalator = () => {
//     console.log("---------------------");
//     console.log("Escalating tickets to a random resolvers");
//     var db = require(libs + 'db/mongoose');
//     var asyncLib = require('async');
//     var Ticket = require(libs + 'model/ticket');
//     var moment = require('moment');
//     var cutoff = new Date();
//     cutoff.setDate(cutoff.getDate()-2);
//     var escalationQuery = {
//         status:2,
//         date : {$lt:cutoff}
//     };
//     // hierarchy for resolvers can be implemented for escalating the authority of the resolver.
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
//     Ticket.find(escalationQuery, (err, tickets) => {
//         if(err){
//             throw err;
//         } else {
//             asyncLib.each(tickets, (ticket, cbEach) => {
//                 randomResolver((err, resolver) => {
//                     if(err){
//                         cbEach(err);
//                     } else {
//                         ticket.status = 0;
//                         let dateString = moment().format('YYYY-MM-DD HH:m:ss');
//                         ticket.remark.push({
//                             resolver_id:resolver.id,
//                             remark:"Ticket escalated on "+dateString
//                         })
//                         ticket.save((err) => {
//                             if(err){
//                                 cbEach(err);
//                             } else {
//                                 console.log('ticket with id : %s escalated to %s', ticket.id, resolver.id);
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
//     })
// }
module.exports = autoEscalator;