var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;

db.on('error', function (err) {
	console.error('Connection error:', err.message);
});

db.once('open', function callback () {
	console.info("Connected to DB!");
});

module.exports = mongoose;