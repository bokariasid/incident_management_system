// var faker = require('faker');

require('dotenv').config();
var libs = process.cwd() + '/libs/';

var db = require(libs + 'db/mongoose');
var config = require('./config');

var User = require(libs + 'model/user');
var Resolver = require(libs + 'model/resolver');
var Ticket = require(libs + 'model/ticket');
var Client = require(libs + 'model/client');
var AccessToken = require(libs + 'model/accessToken');
var RefreshToken = require(libs + 'model/refreshToken');

let createFakeUser = async () => {
    let fakeUserPromise =  new Promise((resolve, reject) => {
        User.deleteMany({}, (err) => {
            if(err){
                return reject(err);
            }
            var user = new User({
                username: config.get("default:user:username"),
                password: config.get("default:user:password")
            });
            user.save((err, user) => {
                if(!err) {
                    return resolve(user);
                    console.info("New user - %s:%s", user.username, user.password);
                } else {
                    return reject(err);
                }
            });
        });
    });
    return fakeUserPromise;
}

let createFakeResolver = async () => {
    let fakeUserPromise =  new Promise((resolve, reject) => {
        Resolver.deleteMany({}, (err) => {
            if(err){
                return reject(err);
            }
            var resolver = new Resolver({
                username: config.get("default:resolver:username"),
                password: config.get("default:resolver:password")
            });
            resolver.save((err, user) => {
                if(!err) {
                    return resolve(user);
                    console.info("New user - %s:%s", user.username, user.password);
                } else {
                    return reject(err);
                }
            });
        });
    });
    return fakeUserPromise;
}

let createFakeClient = async () => {
    return new Promise((resolve, reject) => {
        Client.deleteMany({}, (err) => {
            if(err) {return reject(err);}
            var client = new Client({
                name: config.get("default:client:name"),
                clientId: config.get("default:client:clientId"),
                clientSecret: config.get("default:client:clientSecret")
            });
            client.save((err, client) => {
                if(!err) {
                    console.info("New client - %s:%s", client.clientId, client.clientSecret);
                    return resolve(client);
                } else {
                    if(err) {return reject(err);}
                    return console.error(err);
                }
            });
        });
    })
}

async function clearValues () {
    return new Promise((resolve, reject) => {
        AccessToken.deleteMany({}, (err) => {
            if (err) {
                return reject(err);
                // return console.error(err);
            }
            RefreshToken.deleteMany({}, (err) => {
                if (err) {
                    return reject(err);
                    // return console.error(err);
                }
                Ticket.deleteMany({}, (err) => {
                    if (err) {
                        return reject(err);
                        // return console.error(err);
                    }
                    return resolve("values cleared");
                });
            });
        });
    });
}

let fakeValues = async () => {
    try {
        let userResponse = await createFakeUser();
        console.log(userResponse);
        let resolverResponse = await createFakeResolver();
        console.log(resolverResponse);
        let clientResponse = await createFakeClient();
        console.log(clientResponse);
        let clearResponse = await clearValues();
        console.log(clearResponse);
        db.disconnect();
        process.exit();
    } catch(e){
        console.log(e);
    }
}
fakeValues();