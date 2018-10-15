var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');

var libs = process.cwd() + '/libs/';

var log = console;

var db = require(libs + 'db/mongoose');
var Resolver = require(libs + 'model/resolver');
var AccessToken = require(libs + 'model/accessToken');
var RefreshToken = require(libs + 'model/refreshToken');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Generic error handler
var errFn = function (cb, err) {
	if (err) {
		return cb(err);
	}
};

// Destroys any old tokens and generates a new access and refresh token
var generateTokens =  (data, done) => {

	// curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done),
	    refreshToken,
	    refreshTokenValue,
	    token,
	    tokenValue;

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save((err) => {
    	if (err) {
			log.error(err);
    		return done(err);
    	}
    	done(null, tokenValue, refreshTokenValue, {
    		'expires_in': process.env.TOKEN_TTL
    	});
    });
};

// Exchange resolvername & password for access token.
aserver.exchange(oauth2orize.exchange.password((client, resolvername, password, scope, done) => {
	Resolver.findOne({ username: resolvername }, (err, resolver) => {
		if (err) {
			return done(err);
		}
		if (!resolver || !resolver.checkPassword(password)) {
			return done(null, false);
		}
		// console.log(resolver)
		var model = {
			userId: resolver.userId,
			clientId: client.clientId,
			type:'resolver'
		};
		generateTokens(model, done);
	});

}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
	RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, (err, token) => {
		if (err) {
			return done(err);
		}
		if (!token) {
			return done(null, false);
		}
		Resolver.findById(token.userId, function(err, resolver) {
			if (err) { return done(err); }
			if (!resolver) { return done(null, false); }
			var model = {
				userId: resolver.userId,
				clientId: client.clientId,
				type:'resolver'
			};
			generateTokens(model, done);
		});
	});
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.resolver_token = [
	passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
	aserver.token(),
	aserver.errorHandler()
];
