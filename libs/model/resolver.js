var mongoose = require('mongoose'),
	crypto = require('crypto'),

	Schema = mongoose.Schema,

	Resolver = new Schema({
		username: {
			type: String,
			unique: true,
			required: true
		},
		hashedPassword: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		created: {
			type: Date,
			default: Date.now
		}
	});

Resolver.methods.encryptPasswordForResolver = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

Resolver.virtual('userId')
.get(function(){
	return this.id;
});

Resolver.virtual('password')
	.set(function (password) {
		this._plainPassword = password;
		this.salt = crypto.randomBytes(32).toString('hex');
	        //more secure - this.salt = crypto.randomBytes(128).toString('hex');
	        this.hashedPassword = this.encryptPasswordForResolver(password);
	    })
	.get(function () { return this._plainPassword; });


Resolver.methods.checkPassword = function(password) {
	return this.encryptPasswordForResolver(password) === this.hashedPassword;
};

module.exports = mongoose.model('Resolver', Resolver);
