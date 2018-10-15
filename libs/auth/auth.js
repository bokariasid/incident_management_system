var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var libs = process.cwd() + '/libs/';
var User = require(libs + 'model/user');
var Resolver = require(libs + 'model/resolver');
var Client = require(libs + 'model/client');
var AccessToken = require(libs + 'model/accessToken');
var RefreshToken = require(libs + 'model/refreshToken');

passport.use(new BasicStrategy(
    (username, password, done) => {
        Client.findOne({ clientId: username }, (err, client) => {
            if (err) {
            	return done(err);
            }

            if (!client) {
            	return done(null, false);
            }

            if (client.clientSecret !== password) {
            	return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    (clientId, clientSecret, done) => {
        Client.findOne({ clientId: clientId }, (err, client) => {
            if (err) {
            	return done(err);
            }

            if (!client) {
            	return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
            	return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    (accessToken, done) => {
        AccessToken.findOne({ token: accessToken }, (err, token) => {
            if (err) {
            	return done(err);
            }

            if (!token) {
            	return done(null, false);
            }
            if( Math.round((Date.now()-token.created)/1000) > process.env.TOKEN_TTL ) {

                AccessToken.remove({ token: accessToken }, (err) => {
                    if (err) {
                    	return done(err);
                    }
                });

                return done(null, false, { message: 'Token expired' });
            }
            switch(token.type){
                case "user":
                    User.findById(token.userId, (err, user) => {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false, { message: 'Unknown user' });
                        }
                        var info = { scope: '*' };
                        done(null, user, info);
                    });
                    break;
                case "resolver":
                    Resolver.findById(token.userId, (err, user) => {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false, { message: 'Unknown user' });
                        }
                        var info = { scope: '*' };
                        done(null, user, info);
                    });
                    break;
            }
        });
    }
));